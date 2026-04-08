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

    # SMS (알리고)
    ALIGO_API_KEY: str = ""
    ALIGO_USER_ID: str = ""
    ALIGO_SENDER: str = ""
    ADMIN_PHONE: str = ""

    # 무통장 입금 계좌 정보
    BANK_ACCOUNT: str = "농협 716-12-338141"
    BANK_HOLDER: str = ""

    # AWS S3 이미지 스토리지
    USE_S3: bool = False  # True로 설정하면 로컬 대신 S3 사용
    AWS_REGION: str = "ap-northeast-2"
    S3_BUCKET_NAME: str = ""
    S3_CDN_BASE_URL: str = ""  # CloudFront URL (예: https://cdn.cheonghwa-farm.com)
    # EC2 IAM Role 사용 시 불필요. 로컬 S3 테스트용
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""

    # 주문 관련 설정
    PAYMENT_DEADLINE_HOURS: int = 48
    JEJU_ADDITIONAL_FEE: int = 3000
    REMOTE_AREA_ADDITIONAL_FEE: int = 5000

    @computed_field
    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.BACKEND_CORS_ORIGINS.split(",")
            if origin.strip()
        ]

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
