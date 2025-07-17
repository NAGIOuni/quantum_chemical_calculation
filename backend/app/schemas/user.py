from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    username: str
    role: str
    local_base_dir: str
    remote_base_dir: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    local_base_dir: Optional[str] = None
    remote_base_dir: Optional[str] = None


class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        orm_mode = True
