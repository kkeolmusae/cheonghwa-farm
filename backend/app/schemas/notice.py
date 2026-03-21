from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class NoticeCreate(BaseModel):
    title: str = Field(max_length=255)
    content: str = ""
    is_pinned: bool = False


class NoticeUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    is_pinned: Optional[bool] = None


class NoticeResponse(BaseModel):
    id: int
    title: str
    content: str
    is_pinned: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class NoticeListResponse(BaseModel):
    id: int
    title: str
    is_pinned: bool
    created_at: datetime

    model_config = {"from_attributes": True}
