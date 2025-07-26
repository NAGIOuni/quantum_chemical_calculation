from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from app.schemas.job_bundle import JobBundleCreate, JobBundleUpdate, JobBundleResponse
from app.models.job_bundle import JobBundle
from app.models.user import User
from app.dependencies import get_db, get_current_user
from app.crud import job_bundle as crud

router = APIRouter()


@router.post("/", response_model=JobBundleResponse)
async def create_bundle(
    data: JobBundleCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await crud.create_bundle(db, data, user.id)


@router.get("/", response_model=List[JobBundleResponse])
async def list_bundles(
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
):
    return await crud.get_all_bundles_by_user(db, user.id)


@router.get("/{id}", response_model=JobBundleResponse)
async def get_bundle(
    id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
):
    bundle = await crud.get_bundle_by_id(db, id)
    if not bundle or bundle.user_id != user.id:  # type: ignore
        raise HTTPException(status_code=404, detail="JobBundle not found")
    return bundle


@router.patch("/{id}", response_model=JobBundleResponse)
async def update_bundle(
    id: int,
    data: JobBundleUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    bundle = await crud.get_bundle_by_id(db, id)
    if not bundle or bundle.user_id != user.id:  # type: ignore
        raise HTTPException(status_code=404, detail="JobBundle not found")
    return await crud.update_bundle(db, bundle, data)


@router.delete("/{id}", status_code=204)
async def delete_bundle(
    id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(JobBundle)
        .options(selectinload(JobBundle.molecules))
        .where(JobBundle.id == id)
    )
    bundle = result.scalars().first()
    if not bundle or bundle.user_id != user.id:  # type: ignore
        raise HTTPException(status_code=404, detail="JobBundle not found")
    if bundle.molecules:  # 関連分子が存在するなら削除させない
        raise HTTPException(
            status_code=400, detail="分子が登録されているバンドルは削除できません"
        )
    await crud.delete_bundle(db, bundle)
