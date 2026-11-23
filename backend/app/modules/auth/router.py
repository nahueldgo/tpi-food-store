from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

from .schemas import MensajeRespuesta, UserCreate, UserPublic
from .service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])

COOKIE_NAME = "access_token"


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def registrar(data: UserCreate, service: AuthService = Depends(get_auth_service)):
    return service.registrar(data)


@router.post("/token", response_model=MensajeRespuesta)
def login(
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
):
    token = service.login(form.username, form.password)
    # El token viaja SOLO en la cookie HttpOnly: el JavaScript del frontend no puede leerla
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,  # en produccion con HTTPS va True
        path="/",
    )
    return MensajeRespuesta(message="Login exitoso")


@router.post("/logout", response_model=MensajeRespuesta)
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/", httponly=True, samesite="lax")
    return MensajeRespuesta(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(usuario: Usuario = Depends(get_current_active_user)):
    return UserPublic.model_validate(usuario)
