from pydantic import BaseModel, Field, validator
from app.utils.validators import validate_username, validate_password


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)

    @validator("username")
    def validate_username_field(cls, v):
        return validate_username(v)

    @validator("password")
    def validate_password_field(cls, v):
        return validate_password(v)
