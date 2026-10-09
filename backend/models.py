
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime
from .database import Base


class URL(Base):
    __tablename__ = "urls"

    id = Column(Integer, primary_key=True, index=True)

    original_url = Column(String, nullable=False)

    short_code = Column(
        String(10),
        unique=True,
        index=True,
        nullable=False
    )

    clicks = Column(Integer, default=0, nullable=False)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
