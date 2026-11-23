from collections.abc import Callable
from typing import Optional

from fastapi import Cookie, Depends, HTTPException, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository

CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


def get_current_user(
    access_token: Optional[str] = Cookie(default=None),
    session: Session = Depends(get_session),
) -> Usuario:
    # Lee el JWT de la cookie HttpOnly, valida firma y expiracion y carga el usuario
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    username = decode_access_token(access_token)
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión inválida o expirada"
        )
    usuario = UsuarioRepository(session).get_by_username(username)
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
    return usuario


def get_current_active_user(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    if usuario.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=CUENTA_DESACTIVADA)
    return usuario


def require_role(roles: list[str]) -> Callable[[Usuario], Usuario]:
    # Uso: Depends(require_role(["admin"]))
    def verificar(usuario: Usuario = Depends(get_current_active_user)) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta operación",
            )
        return usuario

    return verificar
