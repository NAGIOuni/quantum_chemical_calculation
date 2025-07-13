from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base
from datetime import datetime, timezone
import uuid


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    local_base_dir = Column(String(512), nullable=False)
    remote_base_dir = Column(String(512), nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    server_credentials = relationship("ServerCredential", back_populates="user")
    job_bundles = relationship("JobBundle", back_populates="user")
