from typing import Annotated, Optional

from pydantic import StringConstraints
from sqlmodel import Field, SQLModel

NombreCategoria = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]
Descripcion = Annotated[str, StringConstraints(strip_whitespace=True, max_length=255)]


class CategoriaCreate(SQLModel):
    nombre: NombreCategoria = Field(schema_extra={"examples": ["Pizzas"]})
    descripcion: Optional[Descripcion] = Field(default=None, schema_extra={"examples": ["Pizzas a la piedra"]})


class CategoriaUpdate(SQLModel):
    # PUT parcial: solo se actualizan los campos enviados
    nombre: Optional[NombreCategoria] = None
    descripcion: Optional[Descripcion] = None


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    activo: bool
