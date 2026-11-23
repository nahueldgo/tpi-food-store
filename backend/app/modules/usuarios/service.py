from fastapi import HTTPException, status

from .models import Usuario
from .schemas import UserPublic
from .unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    # En usuarios se admite lanzar HTTPException desde el Service (como en el proyecto de seguridad)

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_ordenados()]

    def _obtener(self, uow: UsuarioUnitOfWork, usuario_id: int) -> Usuario:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        return usuario

    def activar(self, usuario_id: int) -> UserPublic:
        # Idempotente: responde 200 aunque ya estuviera activo
        with self.uow as uow:
            usuario = self._obtener(uow, usuario_id)
            usuario.disabled = False
            uow.session.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, admin_actual: Usuario) -> UserPublic:
        with self.uow as uow:
            usuario = self._obtener(uow, usuario_id)
            if usuario.id == admin_actual.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No podés desactivar tu propia cuenta",
                )
            usuario.disabled = True
            uow.session.add(usuario)
            return UserPublic.model_validate(usuario)
