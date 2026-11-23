from typing import Optional

from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository

from .models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        skip: int,
        limit: int,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> tuple[int, list[Producto]]:
        # Solo productos activos; devuelve (total, pagina)
        filtros = [Producto.activo == True]  # noqa: E712
        if search:
            filtros.append(col(Producto.nombre).ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        items = self.session.exec(
            select(Producto).where(*filtros).order_by(col(Producto.id)).offset(skip).limit(limit)
        ).all()
        return total, list(items)
