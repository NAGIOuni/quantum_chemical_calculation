from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.models.molecule import Molecule
from app.models.user import User
from app.schemas.molecule import MoleculeCreate, MoleculeUpdate, MoleculeResponse
from app.crud import molecule as crud
from app.dependencies import get_db, get_current_user

router = APIRouter()


@router.post("/", response_model=MoleculeResponse)
async def create_molecule(
    data: MoleculeCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # 所有バンドルの確認など行うならここでチェック
    return await crud.create_molecule(db, data)


@router.get("/", response_model=List[MoleculeResponse])
async def list_molecules(
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
):
    return await crud.get_all_molecules_by_user(db, user.id)  # type: ignore


@router.get("/{id}", response_model=MoleculeResponse)
async def get_molecule(
    id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
):
    molecule = await crud.get_molecule(db, id)
    if not molecule or molecule.job_bundle.user_id != user.id:
        raise HTTPException(status_code=404, detail="Molecule not found")
    return molecule


@router.patch("/{id}", response_model=MoleculeResponse)
async def update_molecule(
    id: int,
    data: MoleculeUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    molecule = await crud.get_molecule(db, id)
    if not molecule or molecule.job_bundle.user_id != user.id:
        raise HTTPException(status_code=404, detail="Molecule not found")
    return await crud.update_molecule(db, molecule, data)


@router.delete("/{id}", status_code=204)
async def delete_molecule(
    id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
):
    molecule = await crud.get_molecule(db, id)
    if not molecule or molecule.job_bundle.user_id != user.id:
        raise HTTPException(status_code=404, detail="Molecule not found")
    await crud.delete_molecule(db, molecule)
