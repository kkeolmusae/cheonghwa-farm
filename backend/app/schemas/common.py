from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationParams(BaseModel):
    offset: int = Field(0, ge=0, description="건너뛸 항목 수")
    limit: int = Field(20, ge=1, le=100, description="조회할 항목 수")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    offset: int
    limit: int
