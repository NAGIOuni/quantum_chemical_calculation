from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.models.molecule import Molecule
from app.models.user import User
from app.schemas.molecule import MoleculeCreate, MoleculeUpdate, MoleculeResponse
from app.crud import molecule as crud_mol, job_bundle as crud_bundle
from app.dependencies import get_db, get_current_user

router = APIRouter()


@router.post("/", response_model=MoleculeResponse)
async def create_molecule(
    data: MoleculeCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # 所有バンドルの確認など行うならここでチェック
    return await crud_mol.create_molecule(db, data)


@router.get("/", response_model=List[MoleculeResponse])
async def list_molecules(
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
):
    return await crud_mol.get_all_molecules_by_user(db, user.id)  # type: ignore


@router.get("/{id}", response_model=MoleculeResponse)
async def get_molecule(
    id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
):
    molecule = await crud_mol.get_molecule(db, id)
    bundle = await crud_bundle.get_bundle_by_id(db, molecule.bundle_id)  # type: ignore
    if not molecule or bundle.user_id != user.id:  # type: ignore
        raise HTTPException(status_code=404, detail="Molecule not found")
    return molecule


@router.patch("/{id}", response_model=MoleculeResponse)
async def update_molecule(
    id: int,
    data: MoleculeUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    molecule = await crud_mol.get_molecule(db, id)
    bundle = await crud_bundle.get_bundle_by_id(db, molecule.bundle_id)  # type: ignore

    if not molecule or bundle.user_id != user.id:  # type: ignore
        raise HTTPException(status_code=404, detail="Molecule not found")
    return await crud_mol.update_molecule(db, molecule, data)


@router.delete("/{id}", status_code=204)
async def delete_molecule(
    id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
):
    molecule = await crud_mol.get_molecule(db, id)
    bundle = await crud_bundle.get_bundle_by_id(db, molecule.bundle_id)  # type: ignore
    if not molecule or bundle.user_id != user.id:  # type: ignore
        raise HTTPException(status_code=404, detail="Molecule not found")
    await crud_mol.delete_molecule(db, molecule)
