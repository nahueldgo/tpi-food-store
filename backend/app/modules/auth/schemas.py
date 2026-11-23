from sqlmodel import SQLModel

# El registro usa UserCreate y la respuesta UserPublic (modulo usuarios)
from app.modules.usuarios.schemas import UserCreate, UserPublic

__all__ = ["UserCreate", "UserPublic", "MensajeRespuesta"]


class MensajeRespuesta(SQLModel):
    message: str
