from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import verify_token
from app.models.admin import Admin

bearer_scheme = HTTPBearer()


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Admin:
    """JWT Bearer 토큰에서 관리자 정보를 추출하여 반환."""
    payload = verify_token(credentials.credentials, expected_type="access")
    admin_id = payload.get("sub")
    if admin_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="토큰에 사용자 정보가 없습니다.",
        )

    result = await db.execute(select(Admin).where(Admin.id == int(admin_id)))
    admin = result.scalar_one_or_none()
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="관리자를 찾을 수 없습니다.",
        )

    return admin
