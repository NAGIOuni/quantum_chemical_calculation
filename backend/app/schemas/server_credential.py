from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID


class ServerCredentialBase(BaseModel):
    host: str
    username: str
    password_encrypted: str
    auth_method: str


class ServerCredentialCreate(ServerCredentialBase):
    pass


class ServerCredentialUpdate(BaseModel):
    host: Optional[str] = None
    username: Optional[str] = None
    password_encrypted: Optional[str] = None
    auth_method: Optional[str] = None


class ServerCredentialResponse(ServerCredentialBase):
    id: UUID
    created_at: datetime

    class Config:
        orm_mode = True
