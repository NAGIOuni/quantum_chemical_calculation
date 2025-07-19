from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.server_credential import ServerCredential
from app.schemas.server_credential import ServerCredentialCreate, ServerCredentialUpdate
from app.utils.encryption import encrypt_text, decrypt_text
import uuid
from datetime import datetime, timezone


async def create_credential(
    db: AsyncSession, data: ServerCredentialCreate
) -> ServerCredential:
    cred = ServerCredential(**data.dict())
    cred.password_encrypted = encrypt_text(data.password)  # type: ignore
    db.add(cred)
    await db.commit()
    await db.refresh(cred)
    return cred


async def get_all(db: AsyncSession):
    result = await db.execute(select(ServerCredential))
    return result.scalars().all()


async def get_by_id(db: AsyncSession, id: int):
    result = await db.execute(select(ServerCredential).where(ServerCredential.id == id))
    return result.scalars().first()


async def update_credential(
    db: AsyncSession, credential: ServerCredential, data: ServerCredentialUpdate
) -> ServerCredential:
    if data.password:
        credential.password_encrypted = encrypt_text(data.password)  # type: ignore
    if data.host:
        credential.host = data.host  # type: ignore
    if data.username:
        credential.username = data.username  # type: ignore
    if data.auth_method:
        credential.auth_method = data.auth_method  # type: ignore
    await db.commit()
    await db.refresh(credential)
    return credential


async def delete_credential(db: AsyncSession, credential: ServerCredential):
    await db.delete(credential)
    await db.commit()
