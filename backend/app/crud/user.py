from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
import uuid
from datetime import datetime, timezone
from app.utils.security import hash_password


def create_user(db: Session, data: UserCreate) -> User:
    user_data = data.dict()
    raw_password = user_data.pop("password")
    user_data["hashed_password"] = hash_password(raw_password)
    user = User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    return db.query(User).offset(skip).limit(limit).all()


def update_user(db: Session, user: User, user_in: UserUpdate) -> User:
    if user_in.local_base_dir:
        user.local_base_dir = user_in.local_base_dir  # type: ignore
    if user_in.remote_base_dir:
        user.remote_base_dir = user_in.remote_base_dir  # type: ignore
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User):
    db.delete(user)
    db.commit()


from passlib.context import CryptContext

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def authenticate(db: Session, username: str, plain_pw: str):
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not pwd_ctx.verify(plain_pw, user.hashed_password):
        return None
