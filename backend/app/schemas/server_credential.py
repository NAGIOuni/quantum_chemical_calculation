from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ServerCredentialBase(BaseModel):
    host: str
    username: str
    auth_method: str  # "password" or "ssh_key"


class ServerCredentialCreate(ServerCredentialBase):
    password: str  # 暗号化して保存する


class ServerCredentialUpdate(BaseModel):
    host: Optional[str]
    username: Optional[str]
    password: Optional[str]
    auth_method: Optional[str]


class ServerCredentialResponse(ServerCredentialBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
