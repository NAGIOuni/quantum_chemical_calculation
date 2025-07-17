from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.schemas.job_bundle import JobBundleCreate, JobBundleUpdate, JobBundleResponse
from app.models.job_bundle import JobBundle
from app.models.user import User
from app.dependencies import get_db, get_current_user
from app.crud import job_bundle as crud

router = APIRouter(prefix="/job-bundles", tags=["job_bundles"])


@router.post("/", response_model=JobBundleResponse)
def create_bundle(
    data: JobBundleCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return crud.create_bundle(db, user.id, data)


@router.get("/", response_model=List[JobBundleResponse])
def list_bundles(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return crud.get_all_bundles_by_user(db, user.id)


@router.get("/{id}", response_model=JobBundleResponse)
def get_bundle(
    id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    bundle = crud.get_bundle_by_id(db, id)
    if not bundle or bundle.user_id != user.id:  # type: ignore
        raise HTTPException(status_code=404, detail="JobBundle not found")
    return bundle


@router.patch("/{id}", response_model=JobBundleResponse)
def update_bundle(
    id: str,
    data: JobBundleUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    bundle = crud.get_bundle_by_id(db, id)
    if not bundle or bundle.user_id != user.id:  # type: ignore
        raise HTTPException(status_code=404, detail="JobBundle not found")
    return crud.update_bundle(db, bundle, data)


@router.delete("/{id}", status_code=204)
def delete_bundle(
    id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    bundle = crud.get_bundle_by_id(db, id)
    if not bundle or bundle.user_id != user.id:  # type: ignore
        raise HTTPException(status_code=404, detail="JobBundle not found")
    if bundle.molecules:  # 関連分子が存在するなら削除させない
        raise HTTPException(
            status_code=400, detail="分子が登録されているバンドルは削除できません"
        )
    crud.delete_bundle(db, bundle)
