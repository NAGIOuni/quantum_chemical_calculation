import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone

from .base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), nullable=False, unique=True)
    role = Column(String(20), nullable=False)
    local_base_dir = Column(String(512), nullable=False)
    remote_base_dir = Column(String(512), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))
