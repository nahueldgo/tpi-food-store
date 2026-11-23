from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(max_length=50, unique=True, index=True)
    full_name: str = Field(max_length=100)
    email: str = Field(max_length=150, unique=True, index=True)
    hashed_password: str
    role: str = Field(default="user", max_length=10)   # "user" o "admin"
    disabled: bool = Field(default=False)              # baja logica
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Usuario 1:N Pedido
    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
