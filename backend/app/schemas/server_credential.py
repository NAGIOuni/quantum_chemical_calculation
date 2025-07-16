# backend/app/schemas/server_credential.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ServerCredentialBase(BaseModel):
    user_id: str
    hostname: str
    username: str
    password_encrypted: str


class ServerCredentialCreate(ServerCredentialBase):
    pass


class ServerCredentialResponse(ServerCredentialBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
