import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from PIL import Image

from app.core.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
THUMBNAIL_SIZE = (400, 400)
MAX_DIMENSION = 2048


def _ensure_upload_dir() -> Path:
    upload_path = Path(settings.UPLOAD_DIR)
    upload_path.mkdir(parents=True, exist_ok=True)
    (upload_path / "thumbnails").mkdir(exist_ok=True)
    return upload_path


async def save_upload_file(file: UploadFile) -> dict[str, str]:
    """업로드 파일 저장: 원본 리사이즈 + 썸네일 생성 + WebP 변환.

    Returns:
        {"image_url": "/uploads/xxx.webp", "thumbnail_url": "/uploads/thumbnails/xxx.webp"}
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미지 파일만 업로드할 수 있습니다.",
        )

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"허용되지 않는 파일 형식입니다. 허용: {ALLOWED_EXTENSIONS}",
        )

    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"파일 크기가 {settings.MAX_FILE_SIZE // (1024 * 1024)}MB를 초과합니다.",
        )

    upload_path = _ensure_upload_dir()
    unique_name = uuid.uuid4().hex

    img = Image.open(file.file)
    await file.seek(0)

    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    # 원본 리사이즈 (최대 2048px)
    if max(img.size) > MAX_DIMENSION:
        img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)

    original_filename = f"{unique_name}.webp"
    original_path = upload_path / original_filename
    img.save(str(original_path), "WEBP", quality=85)

    # 썸네일 생성 (400x400)
    thumb = img.copy()
    thumb.thumbnail(THUMBNAIL_SIZE, Image.LANCZOS)
    thumb_filename = f"{unique_name}.webp"
    thumb_path = upload_path / "thumbnails" / thumb_filename
    thumb.save(str(thumb_path), "WEBP", quality=80)

    return {
        "image_url": f"/uploads/{original_filename}",
        "thumbnail_url": f"/uploads/thumbnails/{thumb_filename}",
    }
