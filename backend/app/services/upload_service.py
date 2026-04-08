import io
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


def _get_s3_client():
    import boto3

    kwargs = {"region_name": settings.AWS_REGION}
    if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
        kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
        kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY
    return boto3.client("s3", **kwargs)


def _upload_to_s3(img: Image.Image, key: str, quality: int) -> str:
    buf = io.BytesIO()
    img.save(buf, "WEBP", quality=quality)
    buf.seek(0)

    s3 = _get_s3_client()
    s3.put_object(
        Bucket=settings.S3_BUCKET_NAME,
        Key=key,
        Body=buf,
        ContentType="image/webp",
    )

    base = settings.S3_CDN_BASE_URL.rstrip("/") if settings.S3_CDN_BASE_URL else f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com"
    return f"{base}/{key}"


async def save_upload_file(file: UploadFile) -> dict[str, str]:
    """업로드 파일 저장: 원본 리사이즈 + 썸네일 생성 + WebP 변환.

    USE_S3=True 이면 S3/CloudFront URL, 아니면 로컬 /uploads/ 경로 반환.

    Returns:
        {"image_url": "...", "thumbnail_url": "..."}
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

    unique_name = uuid.uuid4().hex

    img = Image.open(io.BytesIO(contents))

    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    # 원본 리사이즈 (최대 2048px)
    if max(img.size) > MAX_DIMENSION:
        img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)

    # 썸네일 생성 (400x400)
    thumb = img.copy()
    thumb.thumbnail(THUMBNAIL_SIZE, Image.LANCZOS)

    original_filename = f"{unique_name}.webp"
    thumb_filename = f"{unique_name}.webp"

    if settings.USE_S3:
        image_url = _upload_to_s3(img, f"uploads/{original_filename}", quality=85)
        thumbnail_url = _upload_to_s3(thumb, f"uploads/thumbnails/{thumb_filename}", quality=80)
    else:
        upload_path = _ensure_upload_dir()
        img.save(str(upload_path / original_filename), "WEBP", quality=85)
        thumb.save(str(upload_path / "thumbnails" / thumb_filename), "WEBP", quality=80)
        image_url = f"/uploads/{original_filename}"
        thumbnail_url = f"/uploads/thumbnails/{thumb_filename}"

    return {
        "image_url": image_url,
        "thumbnail_url": thumbnail_url,
    }
