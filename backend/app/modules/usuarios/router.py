from fastapi import APIRouter, Depends, Path

from app.core.deps import require_role

from .models import Usuario
from .schemas import UserPublic
from .service import UsuarioService
from .unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    _admin: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int = Path(gt=0),
    _admin: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.activar(usuario_id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int = Path(gt=0),
    admin: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.desactivar(usuario_id, admin)
