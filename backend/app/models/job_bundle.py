from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import relationship

from .base import Base


class JobBundle(Base):
    __tablename__ = "job_bundles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=datetime.now(timezone.utc)
    )
    calc_settings = Column(JSON, nullable=True)
    molecules = relationship(
        "Molecule", back_populates="job_bundle", cascade="all, delete-orphan"
    )

    user = relationship("User", backref="job_bundles")
