from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    verify_token,
)
from app.models.admin import Admin
from app.schemas.auth import TokenResponse


async def authenticate_admin(
    db: AsyncSession, email: str, password: str
) -> Admin:
    """이메일/비밀번호로 관리자 인증."""
    result = await db.execute(select(Admin).where(Admin.email == email))
    admin = result.scalar_one_or_none()

    if admin is None or not verify_password(password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
        )

    return admin


def create_tokens(admin: Admin) -> TokenResponse:
    """관리자용 JWT access + refresh 토큰 쌍 생성."""
    access_token = create_access_token(
        subject=admin.id, extra_claims={"email": admin.email}
    )
    refresh_token = create_refresh_token(subject=admin.id)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


async def refresh_tokens(db: AsyncSession, refresh_token: str) -> TokenResponse:
    """리프레시 토큰으로 새 토큰 쌍 발급."""
    payload = verify_token(refresh_token, expected_type="refresh")
    admin_id = payload.get("sub")

    result = await db.execute(select(Admin).where(Admin.id == int(admin_id)))
    admin = result.scalar_one_or_none()
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="관리자를 찾을 수 없습니다.",
        )

    return create_tokens(admin)
