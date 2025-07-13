from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
import uuid
import hashlib
from datetime import datetime, timezone


def get_users(db: Session):
    return db.query(User).all()


def get_user(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user: UserCreate):
    hashed_pw = hashlib.sha256(user.password.encode()).hexdigest()
    db_user = User(
        id=str(uuid.uuid4()),
        username=user.username,
        password_hash=hashed_pw,
        role=user.role,
        local_base_dir=user.local_base_dir,
        remote_base_dir=user.remote_base_dir,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: str):
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False
