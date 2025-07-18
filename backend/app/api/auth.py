from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt
from datetime import timedelta, datetime, timezone

from app.dependencies import get_db, SECRET_KEY, ALGORITHM
from app.models.user import User
from app.crud.user import get_user_by_username
from app.utils.security import verify_password
import app.crud.user as crud_user

router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = 60  # トークン有効時間


@router.post("/token")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = get_user_by_username(db, form_data.username)
    if not user or not user.verify_password(form_data.password):
        raise HTTPException(400, "ユーザー名またはパスワードが正しくありません")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": str(user.id),
        "exp": datetime.now(timezone.utc) + access_token_expires,
    }
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)  # type: ignore
    return {"access_token": token, "token_type": "bearer"}
