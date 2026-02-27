from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Local default: SQLite. In production, override with PostgreSQL DATABASE_URL.
    DATABASE_URL: str = "sqlite:///./hrms_lite.sqlite3"

    # Comma-separated list or "*" for all
    CORS_ORIGINS: str = "*"


settings = Settings()

