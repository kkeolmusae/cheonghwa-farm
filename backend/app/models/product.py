from datetime import date, datetime
from typing import Optional

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(
        String(20), default="판매 예정", server_default="판매 예정"
    )
    harvest_start: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    harvest_end: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    sale_start: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    sale_end: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_deleted: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false"
    )
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now()
    )

    category: Mapped["Category"] = relationship(back_populates="products")  # noqa: F821
    options: Mapped[list["ProductOption"]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )
    images: Mapped[list["ProductImage"]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )


class ProductOption(Base):
    __tablename__ = "product_options"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(100))
    price: Mapped[int] = mapped_column(Integer)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    stock_threshold: Mapped[int] = mapped_column(
        Integer, default=10, server_default="10"
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true"
    )

    product: Mapped["Product"] = relationship(back_populates="options")


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), index=True
    )
    image_url: Mapped[str] = mapped_column(String(500))
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_primary: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false"
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")

    product: Mapped["Product"] = relationship(back_populates="images")
