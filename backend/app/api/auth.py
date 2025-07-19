from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt
from datetime import timedelta, datetime, timezone

from app.dependencies import get_db, SECRET_KEY, ALGORITHM
from app.models.user import User
from app.schemas import Token, TokenData
from app.crud.user import get_user_by_username
from app.utils.security import verify_password
import app.crud.user as crud_user
from app.utils.security import create_access_token

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)
):
    user = await get_user_by_username(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):  # type: ignore
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=TokenData)
async def read_users_me(token: str = Depends(oauth2_scheme)):
    return {"username": "extracted_username_from_token"}
