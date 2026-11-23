from typing import Optional

from app.modules.categorias.service import CategoriaNoEncontrada

from .models import Producto
from .schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from .unit_of_work import ProductoUnitOfWork


# ---------- Excepciones de dominio ----------

class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def _obtener_activo(self, uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        # Un producto dado de baja se trata como inexistente
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado(f"No existe el producto con id {producto_id}")
        return producto

    def _validar_categoria(self, uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(f"No existe la categoría con id {categoria_id}")

    def listar(
        self,
        skip: int,
        limit: int,
        search: Optional[str],
        categoria_id: Optional[int],
        disponible: Optional[bool],
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in items]
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._obtener_activo(uow, producto_id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, data.categoria_id)
            producto = uow.productos.add(Producto.model_validate(data))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._obtener_activo(uow, producto_id)
            cambios = data.model_dump(exclude_unset=True)  # solo los campos enviados
            if cambios.get("categoria_id") is not None:
                self._validar_categoria(uow, cambios["categoria_id"])
            producto.sqlmodel_update(cambios)
            uow.session.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)  # recarga la relacion categoria
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._obtener_activo(uow, producto_id)
            producto.sqlmodel_update(data.model_dump(exclude_unset=True))
            uow.session.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        # Baja logica
        with self.uow as uow:
            producto = self._obtener_activo(uow, producto_id)
            producto.activo = False
            uow.session.add(producto)
