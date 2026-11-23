from datetime import datetime
from typing import Optional

from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository

from .models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def list_by_usuario(
        self,
        usuario_id: Optional[int],
        skip: int,
        limit: int,
        estado: Optional[str] = None,
    ) -> tuple[int, list[Pedido]]:
        # usuario_id None = todos los pedidos (admin). Devuelve (total, pagina)
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        items = self.session.exec(
            select(Pedido).where(*filtros).order_by(col(Pedido.id).desc()).offset(skip).limit(limit)
        ).all()
        return total, list(items)

    def count_by_estado(self, estado: str) -> int:
        consulta = select(func.count()).select_from(Pedido).where(Pedido.estado == estado)
        return self.session.exec(consulta).one()

    def count_desde(self, desde: datetime) -> int:
        consulta = select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        return self.session.exec(consulta).one()

    def sum_total_by_estado(self, estado: str) -> float:
        consulta = select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        return float(self.session.exec(consulta).one())
