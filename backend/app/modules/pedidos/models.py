from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


def _ahora() -> datetime:
    return datetime.now(timezone.utc)


class Pedido(SQLModel, table=True):
    __tablename__ = "pedidos"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", index=True)
    estado: str = Field(default="PENDIENTE", max_length=20, index=True)
    forma_pago: str = Field(max_length=20)          # EFECTIVO o TRANSFERENCIA
    direccion_entrega: str = Field(max_length=200)
    notas: Optional[str] = Field(default=None, max_length=500)
    total: float = Field(default=0)                 # suma de subtotales, fijo desde la creacion
    created_at: datetime = Field(default_factory=_ahora)
    updated_at: datetime = Field(default_factory=_ahora)

    # Usuario 1:N Pedido
    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    # Pedido 1:N DetallePedido (composicion: las lineas pertenecen al pedido)
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalles_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", index=True)
    producto_id: int = Field(foreign_key="productos.id")
    cantidad: int
    # Copia del nombre y del precio al momento de la compra (linea inmutable, RN-05)
    nombre_producto: str = Field(max_length=150)
    precio_unitario: float
    subtotal: float

    pedido: Optional[Pedido] = Relationship(back_populates="items")
    # Producto 1:N DetallePedido
    producto: Optional["Producto"] = Relationship(back_populates="detalles")
