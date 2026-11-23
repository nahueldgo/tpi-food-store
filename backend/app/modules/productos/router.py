from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.usuarios.models import Usuario

from .schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from .service import ProductoNoEncontrado, ProductoService
from .unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    categoria_id: Optional[int] = Query(default=None, gt=0),
    disponible: Optional[bool] = Query(default=None),
    service: ProductoService = Depends(get_producto_service),
):
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(
    producto_id: int = Path(gt=0),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(
    data: ProductoCreate,
    _admin: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    data: ProductoUpdate,
    producto_id: int = Path(gt=0),
    _admin: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    data: ProductoStockUpdate,
    producto_id: int = Path(gt=0),
    _admin: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def eliminar_producto(
    producto_id: int = Path(gt=0),
    _admin: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
