from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
import uuid
from datetime import datetime, timezone
from app.utils.security import hash_password


def create_user(db: Session, user_in: UserCreate) -> User:
    user = User(
        id=str(uuid.uuid4()),
        username=user_in.username,
        role=user_in.role,
        local_base_dir=user_in.local_base_dir,
        remote_base_dir=user_in.remote_base_dir,
        password_hash=hash_password(user_in.password),
        created_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: str) -> User:
    return db.query(User).filter(User.id == user_id).first()


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
