from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.auth import AdminLogin, TokenRefresh, TokenResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["인증"])


class GoogleLoginRequest(BaseModel):
    credential: str


@router.post(
    "/admin/login",
    response_model=TokenResponse,
    summary="관리자 로그인",
    description="이메일과 비밀번호로 관리자 로그인 후 JWT 토큰을 발급합니다.",
)
async def admin_login(
    body: AdminLogin,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    admin = await auth_service.authenticate_admin(db, body.email, body.password)
    return auth_service.create_tokens(admin)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="토큰 갱신",
    description="리프레시 토큰을 사용하여 새로운 액세스/리프레시 토큰 쌍을 발급합니다.",
)
async def refresh_token(
    body: TokenRefresh,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    return await auth_service.refresh_tokens(db, body.refresh_token)


@router.post(
    "/google",
    response_model=TokenResponse,
    summary="Google OAuth 로그인",
    description="Google ID 토큰을 검증하여 허용된 계정이면 JWT 토큰을 발급합니다.",
)
async def google_login(
    body: GoogleLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    return await auth_service.google_login(db, body.credential)
