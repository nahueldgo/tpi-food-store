from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"

    id: Optional[int] = Field(default=None, primary_key=True)
    # La baja logica NO libera el nombre: la unicidad incluye a las inactivas
    nombre: str = Field(max_length=100, unique=True, index=True)
    descripcion: Optional[str] = Field(default=None, max_length=255)
    activo: bool = Field(default=True)

    # Categoria 1:N Producto
    productos: list["Producto"] = Relationship(back_populates="categoria")
