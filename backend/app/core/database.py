from collections.abc import Iterator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite necesita este parametro para usarse desde varios hilos (solo desarrollo)
_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)


def create_all_tables() -> None:
    # Importa los modelos para que SQLModel conozca todas las tablas
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.usuarios import models as _usuarios  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    # Crea una sesion nueva; la usa el Unit of Work
    return Session(engine)


def get_session() -> Iterator[Session]:
    # Dependencia de FastAPI para auth y usuarios
    with session_factory() as session:
        yield session
