from pydantic import computed_field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Farm API"
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://farm:farm_secret@db:5432/farm_db"

    # JWT
    SECRET_KEY: str = "super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS - comma-separated string from env
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174"

    # Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB

    # Admin seed
    ADMIN_EMAIL: str = "admin@farm.example.com"
    ADMIN_PASSWORD: str = "admin1234"
    ADMIN_NAME: str = "농장관리자"

    @computed_field
    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
