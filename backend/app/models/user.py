from sqlalchemy import Column, String, DateTime
from datetime import datetime, timezone
from sqlalchemy import Integer
from .base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    hashed_password = Column(String, nullable=False)
    username = Column(String(50), nullable=False, unique=True)
    role = Column(String(20), nullable=False, default="user")
    local_base_dir = Column(String(512), nullable=False)
    remote_base_dir = Column(String(512), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))
