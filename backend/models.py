from sqlalchemy import Column, Integer, String, text
from sqlalchemy.dialects.postgresql import UUID
from settings import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        index=True,
        default=text("gen_random_uuid()"),
    )
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
