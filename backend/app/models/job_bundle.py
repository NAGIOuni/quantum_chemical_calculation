import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import relationship

from .base import Base


class JobBundle(Base):
    __tablename__ = "job_bundles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))
    calc_settings = Column(JSON, nullable=True)

    user = relationship("User", backref="job_bundles")
