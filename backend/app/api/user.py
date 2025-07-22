from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.crud import user as crud_user
from app.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=UserResponse)
async def register_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # 既存ユーザー確認処理が必要であれば追加
    return await crud_user.create_user(db, user_in)


@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_current_user(
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await crud_user.update_user(db, current_user, user_in)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud_user.delete_user(db, current_user)
