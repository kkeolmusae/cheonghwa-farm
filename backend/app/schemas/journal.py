from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class JournalImageResponse(BaseModel):
    id: int
    image_url: str
    thumbnail_url: Optional[str] = None
    is_primary: bool
    sort_order: int

    model_config = {"from_attributes": True}


class JournalImageCreate(BaseModel):
    image_url: str
    thumbnail_url: Optional[str] = None
    sort_order: int = 0


class JournalCreate(BaseModel):
    title: str = Field(max_length=255)
    content: str = ""
    created_at: Optional[datetime] = None
    images: list[JournalImageCreate] = Field(default_factory=list)


class JournalUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    created_at: Optional[datetime] = None
    images: Optional[list[JournalImageCreate]] = None


class JournalResponse(BaseModel):
    id: int
    title: str
    content: str
    images: list[JournalImageResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class JournalListResponse(BaseModel):
    id: int
    title: str
    primary_image: Optional[JournalImageResponse] = None
    created_at: datetime

    model_config = {"from_attributes": True}
