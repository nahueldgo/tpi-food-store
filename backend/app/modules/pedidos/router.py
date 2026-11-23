from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

from .schemas import CambioEstado, EstadoPedido, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from .unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


def _a_http(error: Exception) -> HTTPException:
    # Traduce las excepciones de dominio a codigos HTTP
    if isinstance(error, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
    if isinstance(error, PedidoAjeno):
        return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(error))
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))


ERRORES_DOMINIO = (
    PedidoNoEncontrado,
    ProductoNoEncontrado,
    PedidoAjeno,
    ProductoNoDisponible,
    StockInsuficiente,
    ProductoRepetido,
    TransicionInvalida,
)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.crear(data, usuario)
    except ERRORES_DOMINIO as e:
        raise _a_http(e)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: Optional[EstadoPedido] = Query(default=None),
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    return service.listar(usuario, skip, limit, estado)


# Se declara antes de /{pedido_id} para que "resumen" no se tome como un id
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(
    _admin: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int = Path(gt=0),
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.obtener(pedido_id, usuario)
    except ERRORES_DOMINIO as e:
        raise _a_http(e)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado_pedido(
    data: CambioEstado,
    pedido_id: int = Path(gt=0),
    _admin: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except ERRORES_DOMINIO as e:
        raise _a_http(e)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int = Path(gt=0),
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.cancelar(pedido_id, usuario)
    except ERRORES_DOMINIO as e:
        raise _a_http(e)
