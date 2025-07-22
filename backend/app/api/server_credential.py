from io import StringIO
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import paramiko

from app.schemas.server_credential import (
    ServerCredentialCreate,
    ServerCredentialUpdate,
    ServerCredentialResponse,
)
from app.crud.server_credential import (
    create_credential,
    get_all_credentials,
    get_credential_by_id,
    update_credential,
    delete_credential,
)
from app.dependencies import get_db
from app.models.server_credential import AuthMethod


router = APIRouter()


@router.post(
    "/",
    response_model=ServerCredentialResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create(
    data: ServerCredentialCreate,
    db: AsyncSession = Depends(get_db),
):
    return await create_credential(db, data)


@router.get(
    "/",
    response_model=list[ServerCredentialResponse],
)
async def read_all(
    db: AsyncSession = Depends(get_db),
):
    return await get_all_credentials(db)


@router.get(
    "/{credential_id}",
    response_model=ServerCredentialResponse,
)
async def read_one(
    credential_id: int,
    db: AsyncSession = Depends(get_db),
):
    cred = await get_credential_by_id(db, credential_id)
    if not cred:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credential not found",
        )
    return cred


@router.patch(
    "/{credential_id}",
    response_model=ServerCredentialResponse,
)
async def patch(
    credential_id: int,
    data: ServerCredentialUpdate,
    db: AsyncSession = Depends(get_db),
):
    cred = await get_credential_by_id(db, credential_id)
    if not cred:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credential not found",
        )
    return await update_credential(db, cred, data)


@router.delete(
    "/{credential_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove(
    credential_id: int,
    db: AsyncSession = Depends(get_db),
):
    cred = await get_credential_by_id(db, credential_id)
    if not cred:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credential not found",
        )
    await delete_credential(db, cred)


@router.post(
    "/test-connection",
    summary="サーバー接続テスト",
)
async def test_connection(
    data: ServerCredentialCreate,
):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    # 接続パラメータ組み立て
    conn_kwargs: dict = {
        "hostname": data.host,
        "port": data.port,
        "username": data.username,
        "timeout": 5,
    }

    if data.auth_method == AuthMethod.password:
        if not data.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="password is required for auth_method=password",
            )
        conn_kwargs["password"] = data.password
    else:  # ssh_key
        if not data.ssh_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ssh_key is required for auth_method=ssh_key",
            )
        # 文字列から RSAKey をロード
        pkey = paramiko.RSAKey.from_private_key(StringIO(data.ssh_key))
        conn_kwargs["pkey"] = pkey

    try:
        client.connect(**conn_kwargs)
        client.close()
        return {"result": "接続成功"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"接続失敗: {e}",
        )
