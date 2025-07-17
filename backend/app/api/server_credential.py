from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.server_credential import (
    ServerCredentialCreate,
    ServerCredentialUpdate,
    ServerCredentialResponse,
)
from app.crud import server_credential as crud
from app.dependencies import get_db
from app.models.server_credential import ServerCredential

import paramiko

router = APIRouter(prefix="/server-credentials", tags=["server_credentials"])


@router.post("/", response_model=ServerCredentialResponse)
def create(data: ServerCredentialCreate, db: Session = Depends(get_db)):
    return crud.create_credential(db, data)


@router.get("/", response_model=list[ServerCredentialResponse])
def get_all(db: Session = Depends(get_db)):
    return crud.get_all(db)


@router.get("/{id}", response_model=ServerCredentialResponse)
def get_one(id: str, db: Session = Depends(get_db)):
    credential = crud.get_by_id(db, id)
    if not credential:
        raise HTTPException(status_code=404, detail="Credential not found")
    return credential


@router.patch("/{id}", response_model=ServerCredentialResponse)
def update(id: str, data: ServerCredentialUpdate, db: Session = Depends(get_db)):
    credential = crud.get_by_id(db, id)
    if not credential:
        raise HTTPException(status_code=404, detail="Credential not found")
    return crud.update_credential(db, credential, data)


@router.delete("/{id}", status_code=204)
def delete(id: str, db: Session = Depends(get_db)):
    credential = crud.get_by_id(db, id)
    if not credential:
        raise HTTPException(status_code=404, detail="Credential not found")
    crud.delete_credential(db, credential)


@router.post("/test-connection")
def test_connection(data: ServerCredentialCreate):
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
