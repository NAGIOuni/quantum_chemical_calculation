from pydantic import BaseModel, Field, validator
from datetime import datetime
from app.utils.validators import validate_username, validate_password, validate_path


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    role: str = Field(default="user", regex="^(user|admin)$")
    local_base_dir: str = Field(..., max_length=512)
    remote_base_dir: str = Field(..., max_length=512)

    @validator("username")
    def validate_username_field(cls, v):
        return validate_username(v)

    @validator("local_base_dir")
    def validate_local_base_dir_field(cls, v):
        return validate_path(v, "ローカルベースディレクトリ")

    @validator("remote_base_dir")
    def validate_remote_base_dir_field(cls, v):
        return validate_path(v, "リモートベースディレクトリ")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)

    @validator("password")
    def validate_password_field(cls, v):
        return validate_password(v)


class UserUpdate(BaseModel):
    local_base_dir: str | None = Field(None, max_length=512)
    remote_base_dir: str | None = Field(None, max_length=512)

    @validator("local_base_dir")
    def validate_local_base_dir_field(cls, v):
        if v is not None:
            return validate_path(v, "ローカルベースディレクトリ")
        return v

    @validator("remote_base_dir")
    def validate_remote_base_dir_field(cls, v):
        if v is not None:
            return validate_path(v, "リモートベースディレクトリ")
        return v


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
