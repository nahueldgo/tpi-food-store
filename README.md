# Food Store · Sistema de pedidos de comida

Trabajo Práctico Integrador de **Programación 4**. Aplicación web completa para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un carrito y confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios.

- **Autor:** Nahuel Dugo
- **Repositorio:** `https://github.com/nahueldgo/tpi-food-store`
- **Video:** `https://drive.google.com/file/d/1ZXFpvaHirp8Nwt3eLKihJRuYxEd0jpvD/view?usp=sharing`

## Tecnologías

| Backend | Frontend |
|---|---|
| Python 3.11 a 3.13 | Node.js 20.19 o superior, pnpm 9 o superior |
| FastAPI + SQLModel | React 19 + TypeScript (`strict: true`) + Vite |
| PostgreSQL (psycopg2) | Tailwind CSS 4 |
| JWT en cookie HttpOnly (python-jose) | TanStack Query, Form y Table |
| Passlib + bcrypt | Zustand (con `persist`), Axios, React Router 7 |

## Estructura

```
.
├── backend/                  API REST (FastAPI)
│   ├── app/
│   │   ├── main.py           App, CORS con credenciales y routers bajo /api/v1
│   │   ├── core/             config, database, security, deps, unit_of_work, base_repository
│   │   ├── modules/          auth, usuarios, categorias, productos, pedidos
│   │   │                     (router → service → unit_of_work → repository → models / schemas)
│   │   └── db/seed.py        Carga inicial idempotente
│   ├── requirements.txt      Versiones fijadas
│   └── .env.example
└── frontend/                 Aplicación React
    ├── src/
    │   ├── shared/           api (axios, errores, queryClient), ui, components, layout
    │   ├── features/         auth, categorias, productos, usuarios, pedidos
    │   │                     (pages, components, hooks, api, types)
    │   ├── store/            authStore y cartStore (Zustand + persist)
    │   └── routes/           AppRouter y ProtectedRoute
    └── .env.example
```

## Requisitos

- **Python** 3.11, 3.12 o 3.13
- **PostgreSQL** 15 o superior
- **Node.js** 20.19 o superior y **pnpm** 9 o superior (`npm install -g pnpm`)

## Instalación y ejecución

### 1. Base de datos

Crear una base de datos vacía en PostgreSQL llamada `foodstore_db`. Las tablas se crean solas.

### 2. Backend

Desde la carpeta `backend/`:

```bash
python -m venv .venv
.venv\Scripts\activate            # Windows
# source .venv/bin/activate       # Linux / macOS

pip install -r requirements.txt

copy .env.example .env            # Windows  (Linux / macOS: cp .env.example .env)
# Editar .env y completar el usuario y la contraseña de PostgreSQL en DATABASE_URL

python -m app.db.seed             # crea las tablas y carga admin, categorías y productos
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación: http://localhost:8000/docs y http://localhost:8000/redoc

### 3. Frontend

Desde la carpeta `frontend/`, con el backend corriendo:

```bash
copy .env.example .env            # Windows  (Linux / macOS: cp .env.example .env)
pnpm install
pnpm build                        # verifica los tipos y compila
pnpm dev
```

Abrir **http://localhost:5173**.

> **Importante:** usar `localhost` (no `127.0.0.1`) tanto en el navegador como en `VITE_API_URL`, para que la cookie de sesión viaje entre el frontend y el backend.

## Variables de entorno

### `backend/.env`

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://postgres:postgres@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |

### `frontend/.env`

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

## Usuarios del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |
| `cliente` | `Cliente1234!` | user (para probar) |

El seed también carga 4 categorías y 9 productos con stock. Ejecutarlo varias veces no duplica datos.

## Funcionalidades

**Cliente:** registro e inicio de sesión; catálogo paginado en el servidor con búsqueda, filtro por categoría, skeleton de carga y estado vacío; carrito persistido en el navegador; checkout con dirección, forma de pago (efectivo o transferencia) y notas; «Mis pedidos» con detalle y cancelación mientras el pedido está pendiente.

**Administrador:** resumen con indicadores (pedidos por estado, pedidos del día e ingresos de los entregados); ABM de categorías y productos con tablas y formularios, cambio de stock y disponibilidad; gestión de pedidos con filtro por estado y avance según la máquina de estados; gestión de usuarios con activar y desactivar.

## Decisiones de diseño

- **Sesión:** el JWT viaja solo en la cookie HttpOnly `access_token`. El frontend nunca lo lee ni lo guarda; `authStore` persiste únicamente los datos del usuario.
- **Unit of Work:** cada Service abre `with self.uow as uow:` y devuelve el schema de salida dentro del bloque. El commit o el rollback ocurren en `__exit__`; ningún Service ni Router llama a `session.commit()`.
- **Creación de pedidos (RN-01):** en una sola transacción se valida cada producto, se descuenta el stock, se crean las líneas copiando nombre y precio, y se calcula el total. Si falla cualquier validación, no se persiste nada.
- **Máquina de estados (RN-02):** `PENDIENTE → EN_PREPARACION → ENTREGADO`, con cancelación posible desde `PENDIENTE` o `EN_PREPARACION`. Al cancelar se restituye el stock en la misma transacción (RN-03).
- **Baja lógica:** categorías y productos se dan de baja con `activo = false` y usuarios con `disabled = true`. Los pedidos no se borran, se cancelan.
- **Errores:** los Services lanzan excepciones de dominio (`ProductoNoEncontrado`, `StockInsuficiente`, `TransicionInvalida`, etc.) y los Routers las traducen a 404, 403, 409 o 400.
- **Estado del frontend:** TanStack Query maneja los datos del servidor (con invalidación después de cada mutación) y Zustand el estado del cliente (sesión y carrito). La única llamada dentro de un `useEffect` es `checkSession` al montar la aplicación.
