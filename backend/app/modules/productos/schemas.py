from typing import Annotated, Optional

from pydantic import StringConstraints
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead

NombreProducto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=150)]
Descripcion = Annotated[str, StringConstraints(strip_whitespace=True, max_length=500)]
Url = Annotated[str, StringConstraints(strip_whitespace=True, max_length=500)]


class ProductoCreate(SQLModel):
    nombre: NombreProducto = Field(schema_extra={"examples": ["Pizza muzzarella"]})
    descripcion: Optional[Descripcion] = None
    precio_base: float = Field(ge=0, schema_extra={"examples": [12000]})
    imagen_url: Optional[Url] = None
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int = Field(gt=0)


class ProductoUpdate(SQLModel):
    # PUT parcial: solo se actualizan los campos enviados
    nombre: Optional[NombreProducto] = None
    descripcion: Optional[Descripcion] = None
    precio_base: Optional[float] = Field(default=None, ge=0)
    imagen_url: Optional[Url] = None
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None
    categoria_id: Optional[int] = Field(default=None, gt=0)


class ProductoStockUpdate(SQLModel):
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    precio_base: float
    imagen_url: Optional[str]
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
