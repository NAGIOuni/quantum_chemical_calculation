import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone

from .base import Base


class ServerCredential(Base):
    __tablename__ = "server_credentials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    host = Column(String(100), nullable=False)
    username = Column(String(100), nullable=False)
    password_encrypted = Column(String(512), nullable=False)
    auth_method = Column(String(20), nullable=False, default="password")
    created_at = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))
