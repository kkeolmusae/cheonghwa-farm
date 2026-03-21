from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FarmJournal(Base):
    __tablename__ = "farm_journals"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now()
    )

    images: Mapped[list["JournalImage"]] = relationship(
        back_populates="journal", cascade="all, delete-orphan"
    )


class JournalImage(Base):
    __tablename__ = "journal_images"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    journal_id: Mapped[int] = mapped_column(
        ForeignKey("farm_journals.id", ondelete="CASCADE"), index=True
    )
    image_url: Mapped[str] = mapped_column(String(500))
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_primary: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false"
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")

    journal: Mapped["FarmJournal"] = relationship(back_populates="images")
