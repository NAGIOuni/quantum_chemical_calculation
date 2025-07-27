from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas import UserCreate, UserUpdate
import uuid
from datetime import datetime, timezone
from app.utils.security import hash_password


async def create_user(db: AsyncSession, data: UserCreate) -> User:
    user_data = data.dict()
    raw_password = user_data.pop("password")
    user_data["hashed_password"] = hash_password(raw_password)
    user = User(**user_data)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()


async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()


async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[User]:
    result = await db.execute(select(User).offset(skip).limit(limit))
    users = result.scalars().all()
    return list(users)


async def update_user(db: AsyncSession, user: User, user_in: UserUpdate) -> User:
    if user_in.local_base_dir:
        user.local_base_dir = user_in.local_base_dir  # type: ignore
    if user_in.remote_base_dir:
        user.remote_base_dir = user_in.remote_base_dir  # type: ignore
    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user: User):
    await db.delete(user)
    await db.commit()
