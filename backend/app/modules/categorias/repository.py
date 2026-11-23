from typing import Optional

from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository

from .models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        # Sin distinguir mayusculas; incluye las dadas de baja (no liberan el nombre)
        consulta = select(Categoria).where(func.lower(Categoria.nombre) == nombre.strip().lower())
        return self.session.exec(consulta).first()

    def list_activas(self) -> list[Categoria]:
        consulta = select(Categoria).where(Categoria.activo == True).order_by(Categoria.nombre)  # noqa: E712
        return list(self.session.exec(consulta).all())
