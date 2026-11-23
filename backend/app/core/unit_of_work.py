from collections.abc import Callable
from types import TracebackType
from typing import Optional

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Abre la sesion en __enter__ y hace commit o rollback y close en __exit__.

    Los Unit of Work de cada modulo heredan de esta clase y crean sus
    repositorios en _crear_repositorios, todos sobre la misma sesion.
    """

    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._factory = factory
        self._session: Optional[Session] = None

    @property
    def session(self) -> Session:
        if self._session is None:
            raise RuntimeError("El Unit of Work no esta abierto: usar 'with uow:'")
        return self._session

    def __enter__(self) -> "UnitOfWork":
        self._session = self._factory()
        self._crear_repositorios()
        return self

    def _crear_repositorios(self) -> None:
        # Cada Unit of Work de modulo lo sobrescribe
        pass

    def __exit__(
        self,
        exc_type: Optional[type[BaseException]],
        exc: Optional[BaseException],
        tb: Optional[TracebackType],
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()    # todo salio bien: se confirma
            else:
                self.session.rollback()  # hubo una excepcion: no se persiste nada
        finally:
            self.session.close()
            self._session = None
