from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.models.server_credential import ServerCredential, AuthMethod
from app.schemas.server_credential import ServerCredentialCreate, ServerCredentialUpdate
from app.utils.encryption import encrypt_text, decrypt_text


async def create_credential(
    db: AsyncSession, data: ServerCredentialCreate
) -> ServerCredential:
    # 新規 Credential オブジェクトを作成（password / ssh_key は後から設定）
    cred = ServerCredential(
        host=data.host,
        port=data.port,
        username=data.username,
        auth_method=data.auth_method,
    )

    # 認証方式に応じて暗号化してセット
    if data.auth_method == AuthMethod.password:
        if not data.password:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "password is required for auth_method=password",
            )
        cred.password_encrypted = encrypt_text(data.password)  # type: ignore
    else:  # AuthMethod.ssh_key
        if not data.ssh_key:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "ssh_key is required for auth_method=ssh_key",
            )
        cred.ssh_key_encrypted = encrypt_text(data.ssh_key)  # type: ignore

    db.add(cred)
    await db.commit()
    await db.refresh(cred)
    return cred


async def get_all_credentials(db: AsyncSession) -> list[ServerCredential]:
    result = await db.execute(select(ServerCredential))
    return list(result.scalars().all())


async def get_credential_by_id(
    db: AsyncSession, credential_id: int
) -> ServerCredential | None:
    result = await db.execute(
        select(ServerCredential).where(ServerCredential.id == credential_id)
    )
    return result.scalars().first()


async def update_credential(
    db: AsyncSession, credential: ServerCredential, data: ServerCredentialUpdate
) -> ServerCredential:
    # ホスト名・ポート・ユーザー名・認証方式の更新
    if data.host is not None:
        credential.host = data.host  # type: ignore
    if data.port is not None:
        credential.port = data.port  # type: ignore
    if data.username is not None:
        credential.username = data.username  # type: ignore
    if data.auth_method is not None:
        credential.auth_method = data.auth_method  # type: ignore
        # 認証方式を切り替えた場合、関連フィールドをクリアして再設定
        credential.password_encrypted = None  # type: ignore
        credential.ssh_key_encrypted = None  # type: ignore

    # パスワードまたは SSH 鍵の更新
    if data.password is not None and credential.auth_method == AuthMethod.password:  # type: ignore
        credential.password_encrypted = encrypt_text(data.password)  # type: ignore
    if data.ssh_key is not None and credential.auth_method == AuthMethod.ssh_key:  # type: ignore
        credential.ssh_key_encrypted = encrypt_text(data.ssh_key)  # type: ignore

    await db.commit()
    await db.refresh(credential)
    return credential


async def delete_credential(db: AsyncSession, credential: ServerCredential) -> None:
    await db.delete(credential)
    await db.commit()
