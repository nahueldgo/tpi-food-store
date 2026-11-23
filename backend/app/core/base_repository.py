from typing import Generic, Optional, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Operaciones comunes a todas las tablas. Sin reglas de negocio."""

    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: int) -> Optional[T]:
        return self.session.get(self.model, entity_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> list[T]:
        return list(self.session.exec(select(self.model).offset(skip).limit(limit)).all())

    def add(self, entity: T) -> T:
        # flush: obtiene el id sin confirmar la transaccion (el commit lo hace el Unit of Work)
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
