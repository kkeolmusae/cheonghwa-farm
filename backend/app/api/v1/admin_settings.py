from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.admin import Admin
from app.models.allowed_google_email import AllowedGoogleEmail

router = APIRouter(prefix="/admin/settings", tags=["관리자 설정"])


class EmailBody(BaseModel):
    email: EmailStr


class AllowedEmailResponse(BaseModel):
    id: int
    email: str
    created_at: str

    model_config = {"from_attributes": True}


@router.get(
    "/google-emails",
    summary="허용된 Google 계정 목록 조회",
)
async def list_google_emails(
    db: AsyncSession = Depends(get_db),
    _: Admin = Depends(get_current_admin),
) -> list[dict]:
    result = await db.execute(
        select(AllowedGoogleEmail).order_by(AllowedGoogleEmail.created_at)
    )
    rows = result.scalars().all()
    return [{"id": r.id, "email": r.email, "created_at": r.created_at.isoformat()} for r in rows]


@router.post(
    "/google-emails",
    status_code=status.HTTP_201_CREATED,
    summary="허용 Google 계정 추가",
)
async def add_google_email(
    body: EmailBody,
    db: AsyncSession = Depends(get_db),
    _: Admin = Depends(get_current_admin),
) -> dict:
    result = await db.execute(
        select(AllowedGoogleEmail).where(AllowedGoogleEmail.email == body.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 등록된 이메일입니다.",
        )
    entry = AllowedGoogleEmail(email=body.email)
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return {"id": entry.id, "email": entry.email, "created_at": entry.created_at.isoformat()}


@router.delete(
    "/google-emails/{email}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="허용 Google 계정 삭제",
)
async def delete_google_email(
    email: str,
    db: AsyncSession = Depends(get_db),
    _: Admin = Depends(get_current_admin),
) -> None:
    result = await db.execute(
        select(AllowedGoogleEmail).where(AllowedGoogleEmail.email == email)
    )
    entry = result.scalar_one_or_none()
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="등록되지 않은 이메일입니다.",
        )
    await db.delete(entry)
    await db.commit()
