from typing import Optional

from .models import Categoria
from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .unit_of_work import CategoriaUnitOfWork


# ---------- Excepciones de dominio (el router las traduce a HTTP) ----------

class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def _obtener_activa(self, uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        # Una categoria dada de baja se trata como inexistente
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(f"No existe la categoría con id {categoria_id}")
        return categoria

    def _validar_nombre(self, uow: CategoriaUnitOfWork, nombre: str, excluir_id: Optional[int] = None) -> None:
        existente = uow.categorias.get_by_nombre(nombre)
        if existente is not None and existente.id != excluir_id:
            raise NombreDuplicado(f"Ya existe una categoría con el nombre '{existente.nombre}'")

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._obtener_activa(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            self._validar_nombre(uow, data.nombre)
            categoria = uow.categorias.add(Categoria(nombre=data.nombre, descripcion=data.descripcion))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._obtener_activa(uow, categoria_id)
            cambios = data.model_dump(exclude_unset=True)  # solo los campos enviados
            if "nombre" in cambios and cambios["nombre"] is not None:
                self._validar_nombre(uow, cambios["nombre"], excluir_id=categoria_id)
            categoria.sqlmodel_update(cambios)
            uow.session.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        # Baja logica: no libera el nombre ni oculta sus productos
        with self.uow as uow:
            categoria = self._obtener_activa(uow, categoria_id)
            categoria.activo = False
            uow.session.add(categoria)
