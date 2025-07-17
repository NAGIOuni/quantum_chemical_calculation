from sqlalchemy.orm import Session
from app.models.server_credential import ServerCredential
from app.schemas.server_credential import ServerCredentialCreate, ServerCredentialUpdate
from app.utils.encryption import encrypt_text, decrypt_text
import uuid
from datetime import datetime, timezone


def create_credential(db: Session, data: ServerCredentialCreate) -> ServerCredential:
    credential = ServerCredential(
        id=str(uuid.uuid4()),
        host=data.host,
        username=data.username,
        auth_method=data.auth_method,
        password_encrypted=encrypt_text(data.password),
        created_at=datetime.now(timezone.utc),
    )
    db.add(credential)
    db.commit()
    db.refresh(credential)
    return credential


def get_all(db: Session):
    return db.query(ServerCredential).all()


def get_by_id(db: Session, id: str):
    return db.query(ServerCredential).filter(ServerCredential.id == id).first()


def update_credential(
    db: Session, credential: ServerCredential, data: ServerCredentialUpdate
):
    if data.host:
        credential.host = data.host  # type: ignore
    if data.username:
        credential.username = data.username  # type: ignore
    if data.auth_method:
        credential.auth_method = data.auth_method  # type: ignore
    if data.password:
        credential.password_encrypted = encrypt_text(data.password)  # type: ignore
    db.commit()
    db.refresh(credential)
    return credential


def delete_credential(db: Session, credential: ServerCredential):
    db.delete(credential)
    db.commit()
