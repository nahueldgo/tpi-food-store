from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.deps import require_role
from app.modules.usuarios.models import Usuario

from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from .unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: CategoriaService = Depends(get_categoria_service)):
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(
    categoria_id: int = Path(gt=0),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    data: CategoriaCreate,
    _admin: Usuario = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.crear(data)
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    data: CategoriaUpdate,
    categoria_id: int = Path(gt=0),
    _admin: Usuario = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def eliminar_categoria(
    categoria_id: int = Path(gt=0),
    _admin: Usuario = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
