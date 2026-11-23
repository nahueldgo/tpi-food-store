from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Los valores se leen del archivo .env (ver .env.example)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/foodstore_db"
    SECRET_KEY: str = "cambiar-esta-clave-de-al-menos-32-caracteres"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
