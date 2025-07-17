from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.server_credential import (
    ServerCredentialResponse,
    ServerCredentialCreate,
    ServerCredentialUpdate,
)
from app.crud import server_credential
from uuid import UUID
from typing import List


router = APIRouter(prefix="/server-credentials", tags=["Server Credentials"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=schemas.ServerCredentialResponse)
def create_credential(
    credential: schemas.ServerCredentialCreate, db: Session = Depends(get_db)
):
    return crud.create_server_credential(db, credential)


@router.get("/", response_model=List[schemas.ServerCredentialResponse])
def read_credentials(db: Session = Depends(get_db)):
    return crud.get_all_credentials(db)


@router.get("/{credential_id}", response_model=schemas.ServerCredentialResponse)
def read_credential(credential_id: UUID, db: Session = Depends(get_db)):
    db_cred = crud.get_server_credential(db, credential_id)
    if db_cred is None:
        raise HTTPException(status_code=404, detail="Credential not found")
    return db_cred


@router.patch("/{credential_id}", response_model=schemas.ServerCredentialResponse)
def update_credential(
    credential_id: UUID,
    credential_update: schemas.ServerCredentialUpdate,
    db: Session = Depends(get_db),
):
    updated = crud.update_server_credential(db, credential_id, credential_update)
    if updated is None:
        raise HTTPException(status_code=404, detail="Credential not found")
    return updated


@router.delete("/{credential_id}", status_code=204)
def delete_credential(credential_id: UUID, db: Session = Depends(get_db)):
    success = crud.delete_server_credential(db, credential_id)
    if not success:
        raise HTTPException(status_code=404, detail="Credential not found")
