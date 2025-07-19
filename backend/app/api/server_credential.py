from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.server_credential import (
    ServerCredentialCreate,
    ServerCredentialUpdate,
    ServerCredentialResponse,
)
from app.crud import server_credential as crud
from app.dependencies import get_db
from app.models.server_credential import ServerCredential

import paramiko

router = APIRouter()


@router.post("/", response_model=ServerCredentialResponse)
async def create(data: ServerCredentialCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_credential(db, data)


@router.get("/", response_model=list[ServerCredentialResponse])
async def get_all(db: AsyncSession = Depends(get_db)):
    return await crud.get_all(db)


@router.get("/{id}", response_model=ServerCredentialResponse)
async def get_one(id: int, db: AsyncSession = Depends(get_db)):
    credential = await crud.get_by_id(db, id)
    if not credential:
        raise HTTPException(status_code=404, detail="Credential not found")
    return await credential


@router.patch("/{id}", response_model=ServerCredentialResponse)
async def update(
    id: int, data: ServerCredentialUpdate, db: AsyncSession = Depends(get_db)
):
    credential = await crud.get_by_id(db, id)
    if not credential:
        raise HTTPException(status_code=404, detail="Credential not found")
    return await crud.update_credential(db, credential, data)


@router.delete("/{id}", status_code=204)
async def delete(id: int, db: AsyncSession = Depends(get_db)):
    credential = await crud.get_by_id(db, id)
    if not credential:
        raise HTTPException(status_code=404, detail="Credential not found")
    await crud.delete_credential(db, credential)


@router.post("/test-connection")
async def test_connection(data: ServerCredentialCreate):
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(
            hostname=data.host,
            username=data.username,
            password=data.password,
            timeout=5,
        )
        client.close()
        return {"result": "接続成功"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"接続失敗: {str(e)}")
