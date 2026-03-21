from fastapi import APIRouter, Depends, UploadFile

from app.core.dependencies import get_current_admin
from app.services import upload_service

router = APIRouter(prefix="/uploads", tags=["파일 업로드"])


@router.post(
    "",
    summary="이미지 업로드",
    description="이미지 파일을 업로드하고 원본 + 썸네일 URL을 반환합니다. 관리자 인증 필요.",
    dependencies=[Depends(get_current_admin)],
)
async def upload_file(
    file: UploadFile,
) -> dict[str, str]:
    return await upload_service.save_upload_file(file)
