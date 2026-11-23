from datetime import datetime
from typing import Annotated

from pydantic import EmailStr, StringConstraints
from sqlmodel import Field, SQLModel

Username = Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=50)]
NombreCompleto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]


class UserCreate(SQLModel):
    username: Username = Field(schema_extra={"examples": ["cliente1"]})
    full_name: NombreCompleto = Field(schema_extra={"examples": ["Juan Pérez"]})
    email: EmailStr = Field(schema_extra={"examples": ["juan@mail.com"]})
    password: str = Field(min_length=8, max_length=72, schema_extra={"examples": ["Cliente1234!"]})


class UserPublic(SQLModel):
    # Nunca incluye hashed_password
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
