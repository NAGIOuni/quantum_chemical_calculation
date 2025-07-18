from sqlalchemy import Column, String, DateTime, Integer
from datetime import datetime, timezone

from .base import Base


class ServerCredential(Base):
    __tablename__ = "server_credentials"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    host = Column(String(100), nullable=False)
    username = Column(String(100), nullable=False)
    password_encrypted = Column(String(512), nullable=False)
    auth_method = Column(String(20), nullable=False, default="password")
    created_at = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))
