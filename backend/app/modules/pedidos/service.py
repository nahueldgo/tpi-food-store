from datetime import datetime, timezone
from typing import Optional

from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

from .models import DetallePedido, Pedido
from .schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .unit_of_work import PedidoUnitOfWork

# ---------- Maquina de estados (RN-02) ----------

PENDIENTE = "PENDIENTE"
EN_PREPARACION = "EN_PREPARACION"
ENTREGADO = "ENTREGADO"
CANCELADO = "CANCELADO"

TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),    # terminal
    CANCELADO: set(),    # terminal
}


# ---------- Excepciones de dominio (el router las traduce a HTTP) ----------

class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ---------- Auxiliares ----------

    @staticmethod
    def _es_admin(usuario: Usuario) -> bool:
        return usuario.role == "admin"

    def _obtener(self, uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(f"No existe el pedido con id {pedido_id}")
        return pedido

    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        # RN-03: devuelve al stock la cantidad de cada linea
        for linea in pedido.items:
            producto = uow.productos.get_by_id(linea.producto_id)
            if producto is not None:
                producto.stock += linea.cantidad
                uow.session.add(producto)

    def _aplicar_transicion(self, uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        # Toda transicion se valida ANTES de modificar el pedido
        if nuevo_estado not in TRANSICIONES[pedido.estado]:
            raise TransicionInvalida(
                f"No se puede pasar un pedido de {pedido.estado} a {nuevo_estado}"
            )
        if nuevo_estado == CANCELADO:
            self._restituir_stock(uow, pedido)   # misma transaccion que el cambio de estado
        pedido.estado = nuevo_estado
        pedido.updated_at = datetime.now(timezone.utc)
        uow.session.add(pedido)

    # ---------- Casos de uso ----------

    def crear(self, data: PedidoCreate, usuario: Usuario) -> PedidoRead:
        # RN-01: todo en una sola transaccion. Si algo falla, el Unit of Work hace rollback
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Hay productos repetidos en el pedido")

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    estado=PENDIENTE,
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0,
                )
            )

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"No existe el producto con id {item.producto_id}")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto '{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}': "
                        f"hay {producto.stock} y se pidieron {item.cantidad}"
                    )

                # En la misma iteracion: se descuenta el stock y se crea la linea
                producto.stock -= item.cantidad
                uow.session.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.session.add(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,          # copia del nombre
                        precio_unitario=producto.precio_base,     # copia del precio
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(self, usuario: Usuario, skip: int, limit: int, estado: Optional[str]) -> PedidosPaginados:
        # RN-04: el admin ve todos; el cliente solo los suyos
        with self.uow as uow:
            usuario_id = None if self._es_admin(usuario) else usuario.id
            total, pedidos = uow.pedidos.list_by_usuario(usuario_id, skip, limit, estado)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if not self._es_admin(usuario) and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        # Solo admin (lo controla el router): avanza o cancela desde cualquier estado no terminal
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            self._aplicar_transicion(uow, pedido, nuevo_estado)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        # RN-04: el dueno solo cancela sus pedidos y solo desde PENDIENTE
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != PENDIENTE:
                raise TransicionInvalida("Solo se puede cancelar un pedido en estado PENDIENTE")
            self._aplicar_transicion(uow, pedido, CANCELADO)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            inicio_hoy = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado(PENDIENTE),
                en_preparacion=uow.pedidos.count_by_estado(EN_PREPARACION),
                entregados=uow.pedidos.count_by_estado(ENTREGADO),
                cancelados=uow.pedidos.count_by_estado(CANCELADO),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=round(uow.pedidos.sum_total_by_estado(ENTREGADO), 2),
            )
