# app/models/server_credential.py

import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, Enum
from app.models.base import Base


class AuthMethod(str, enum.Enum):
    password = "password"
    ssh_key = "ssh_key"


class ServerCredential(Base):
    __tablename__ = "server_credentials"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    host = Column(String, nullable=False, comment="ホスト名")
    port = Column(Integer, nullable=False, default=22, comment="SSH ポート番号")
    username = Column(String, nullable=False, comment="SSH ユーザー名")
    password_encrypted = Column(
        String, nullable=True, comment="Fernet 暗号化済みパスワード"
    )
    ssh_key_encrypted = Column(String, nullable=True, comment="Fernet 暗号化済み秘密鍵")
    auth_method = Column(
        Enum(AuthMethod), nullable=False, comment="認証方式(`password` or `ssh_key`)"
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.now(timezone.utc),
        comment="登録日時",
    )
