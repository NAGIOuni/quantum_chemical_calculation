from pydantic import BaseModel, Field, root_validator
from datetime import datetime
from typing import Optional, Literal
from enum import Enum


class AuthMethod(str, Enum):
    password = "password"
    ssh_key = "ssh_key"


class ServerCredentialBase(BaseModel):
    host: str
    port: int = Field(22, ge=1, le=65535)
    username: str
    auth_method: AuthMethod


class ServerCredentialCreate(ServerCredentialBase):
    password: Optional[str] = None
    ssh_key: Optional[str] = None

    @root_validator
    def check_one_of(cls, values):
        pwd, key, method = (
            values.get("password"),
            values.get("ssh_key"),
            values.get("auth_method"),
        )
        if method == AuthMethod.password and not pwd:
            raise ValueError("auth_method='password' のときは password が必須です")
        if method == AuthMethod.ssh_key and not key:
            raise ValueError("auth_method='ssh_key' のときは ssh_key が必須です")
        return values

    class Config:
        schema_extra = {
            "example": {
                "host": "fe1.scl.kyoto-u.ac.jp",
                "port": 22,
                "username": "kmatlab",
                "auth_method": "ssh_key",
                "ssh_key": "-----BEGIN PRIVATE KEY-----\n…\n-----END PRIVATE KEY-----",
            }
        }


class ServerCredentialUpdate(BaseModel):
    host: Optional[str] = None
    port: Optional[int] = Field(None, ge=1, le=65535)
    username: Optional[str] = None
    auth_method: Optional[AuthMethod] = None
    password: Optional[str] = None
    ssh_key: Optional[str] = None

    @root_validator
    def check_update_consistency(cls, values):
        method = values.get("auth_method")
        pwd = values.get("password")
        key = values.get("ssh_key")
        # auth_method を更新するときは対応する値もセットされているかチェック
        if method == AuthMethod.password and pwd is None:
            raise ValueError(
                "auth_method を 'password' に変更するときは password も必須です"
            )
        if method == AuthMethod.ssh_key and key is None:
            raise ValueError(
                "auth_method を 'ssh_key' に変更するときは ssh_key も必須です"
            )
        return values


class ServerCredentialResponse(ServerCredentialBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
