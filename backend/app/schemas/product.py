from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


# --- Category ---

class CategoryCreate(BaseModel):
    name: str = Field(max_length=100)
    sort_order: int = 0


class CategoryResponse(BaseModel):
    id: int
    name: str
    sort_order: int

    model_config = {"from_attributes": True}


# --- ProductOption ---

class ProductOptionCreate(BaseModel):
    name: str = Field(max_length=100)
    price: int = Field(ge=0)
    stock_quantity: int = Field(ge=0, default=0)
    stock_threshold: int = Field(ge=0, default=10)
    sort_order: int = 0
    is_active: bool = True


class ProductOptionUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    price: Optional[int] = Field(None, ge=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    stock_threshold: Optional[int] = Field(None, ge=0)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class ProductOptionResponse(BaseModel):
    id: int
    name: str
    price: int
    stock_quantity: int
    stock_threshold: int
    sort_order: int
    is_active: bool

    model_config = {"from_attributes": True}


# --- ProductImage ---

class ProductImageResponse(BaseModel):
    id: int
    image_url: str
    thumbnail_url: Optional[str] = None
    is_primary: bool
    sort_order: int

    model_config = {"from_attributes": True}


# --- Product ---

class ProductImageCreate(BaseModel):
    image_url: str
    thumbnail_url: Optional[str] = None
    sort_order: int = 0


class ProductCreate(BaseModel):
    category_id: int
    name: str = Field(max_length=255)
    description: str = ""
    status: str = "판매 예정"
    harvest_start: Optional[date] = None
    harvest_end: Optional[date] = None
    sale_start: Optional[date] = None
    sale_end: Optional[date] = None
    options: list[ProductOptionCreate] = []
    images: list[ProductImageCreate] = Field(default_factory=list)


class ProductUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None
    harvest_start: Optional[date] = None
    harvest_end: Optional[date] = None
    sale_start: Optional[date] = None
    sale_end: Optional[date] = None
    options: Optional[list[ProductOptionCreate]] = None
    images: Optional[list[ProductImageCreate]] = None


class ProductStatusUpdate(BaseModel):
    status: str = Field(description="판매 예정 | 판매 중 | 품절 | 판매 종료")


class ProductResponse(BaseModel):
    id: int
    category_id: int
    category: Optional[CategoryResponse] = None
    name: str
    description: str
    status: str
    harvest_start: Optional[date] = None
    harvest_end: Optional[date] = None
    sale_start: Optional[date] = None
    sale_end: Optional[date] = None
    options: list[ProductOptionResponse] = []
    images: list[ProductImageResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    id: int
    category_id: int
    category: Optional[CategoryResponse] = None
    name: str
    status: str
    harvest_start: Optional[date] = None
    harvest_end: Optional[date] = None
    options: list[ProductOptionResponse] = []
    primary_image: Optional[ProductImageResponse] = None
    created_at: datetime

    model_config = {"from_attributes": True}
