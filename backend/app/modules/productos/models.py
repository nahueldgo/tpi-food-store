from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categorias.id")
    nombre: str = Field(max_length=150, index=True)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    precio_base: float
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    stock: int = Field(default=0)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)   # baja logica

    # Categoria 1:N Producto
    categoria: Optional["Categoria"] = Relationship(back_populates="productos")
    # Producto 1:N DetallePedido
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")
