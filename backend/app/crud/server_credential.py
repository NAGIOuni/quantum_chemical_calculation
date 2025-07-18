from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.server_credential import ServerCredential
from app.schemas.server_credential import ServerCredentialCreate, ServerCredentialUpdate
from app.utils.encryption import encrypt_text, decrypt_text
import uuid
from datetime import datetime, timezone


def create_credential(db: Session, data: ServerCredentialCreate) -> ServerCredential:
    cred = ServerCredential(**data.dict())
    cred.password_encrypted = encrypt_text(data.password)  # type: ignore
    db.add(cred)
    db.commit()
    db.refresh(cred)
    return cred


def get_all(db: Session):
    return db.query(ServerCredential).all()


def get_by_id(db: Session, id: int):
    return db.query(ServerCredential).filter(ServerCredential.id == id).first()


def update_credential(
    db: Session, cred_id: int, data: ServerCredentialUpdate
) -> ServerCredential:
    cred = db.query(ServerCredential).get(cred_id)
    if cred is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Credential {cred_id} not found",
        )
    cred.password_encrypted = encrypt_text(data.password)  # type: ignore
    db.commit()
    db.refresh(cred)
    return cred


def delete_credential(db: Session, credential: ServerCredential):
    db.delete(credential)
    db.commit()
