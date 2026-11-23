"""Carga inicial: usuario admin, un cliente de prueba, categorias y productos.

Es idempotente: solo inserta lo que todavia no existe.
Uso: python -m app.db.seed
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

USUARIOS = [
    # username, password, nombre, email, rol
    ("admin", "Admin1234!", "Administrador", "admin@foodstore.com", "admin"),
    ("cliente", "Cliente1234!", "Cliente de Prueba", "cliente@foodstore.com", "user"),
]

CATEGORIAS = [
    ("Pizzas", "Pizzas a la piedra"),
    ("Hamburguesas", "Hamburguesas caseras con papas"),
    ("Empanadas", "Empanadas al horno"),
    ("Bebidas", "Gaseosas, aguas y jugos"),
]

# nombre, descripcion, precio, stock, categoria, imagen
PRODUCTOS = [
    ("Pizza muzzarella", "Salsa de tomate, muzzarella y aceitunas", 12000, 20, "Pizzas",
     "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600"),
    ("Pizza napolitana", "Muzzarella, tomate en rodajas y ajo", 13500, 15, "Pizzas",
     "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600"),
    ("Hamburguesa clásica", "Medallón de carne, lechuga, tomate y cheddar", 9500, 25, "Hamburguesas",
     "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600"),
    ("Hamburguesa doble bacon", "Doble medallón, cheddar y panceta", 12500, 18, "Hamburguesas",
     "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600"),
    ("Empanada de carne", "Carne cortada a cuchillo", 1500, 60, "Empanadas",
     "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZBUj8GfIBC6oosR2xN1DNEy-EdfEwb6EnYeJvmG8I_e5CbxtTqWP_6xCr&s=10"),
    ("Empanada de jamón y queso", "Jamón cocido y muzzarella", 1400, 50, "Empanadas",
     "https://resizer.glanacion.com/resizer/v2/-VTRMIWQDRFAVPKCEUV6RGFI7IU.jpg?auth=8740f1510c1da057ccfdef522340469348389532f238823f107f349895146231&width=880&height=586&quality=70&smart=true"),
    ("Gaseosa cola 1,5 L", "Botella de 1,5 litros", 3200, 40, "Bebidas",
     "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600"),
    ("Agua mineral 500 ml", "Sin gas", 1500, 30, "Bebidas",
     "https://statics.dinoonline.com.ar/imagenes/full_600x600_ma/3040004_f.jpg"),
    ("Limonada con menta", "Jarra de 1 litro", 4500, 12, "Bebidas",
     "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600"),
]


def ejecutar_seed() -> None:
    create_all_tables()
    with Session(engine) as session:
        for username, password, nombre, email, rol in USUARIOS:
            existe = session.exec(select(Usuario).where(Usuario.username == username)).first()
            if existe is None:
                session.add(Usuario(
                    username=username,
                    full_name=nombre,
                    email=email,
                    hashed_password=hash_password(password),
                    role=rol,
                ))
                print(f"  + usuario {username} ({rol})")

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                session.flush()
                print(f"  + categoría {nombre}")
            categorias[nombre] = categoria

        for nombre, descripcion, precio, stock, nombre_categoria, imagen in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if existe is None:
                session.add(Producto(
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    stock=stock,
                    imagen_url=imagen,
                    categoria_id=categorias[nombre_categoria].id,
                ))
                print(f"  + producto {nombre}")

        session.commit()
    print("Seed completo.")


if __name__ == "__main__":
    ejecutar_seed()
