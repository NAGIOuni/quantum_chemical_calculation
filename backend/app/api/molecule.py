from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from models import Molecule, User
from schemas.molecule import MoleculeCreate, MoleculeUpdate, MoleculeResponse
from crud import molecule as crud
from dependencies import get_db, get_current_user

router = APIRouter(prefix="/molecules", tags=["molecules"])


@router.post("/", response_model=MoleculeResponse)
def create_molecule(
    data: MoleculeCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # 所有バンドルの確認など行うならここでチェック
    return crud.create_molecule(db, data)


@router.get("/", response_model=List[MoleculeResponse])
def list_molecules(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    return crud.get_all_molecules_by_user(db, user.id)  # type: ignore


@router.get("/{id}", response_model=MoleculeResponse)
def get_molecule(
    id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    molecule = crud.get_molecule(db, id)
    if not molecule or molecule.job_bundle.user_id != user.id:
        raise HTTPException(status_code=404, detail="Molecule not found")
    return molecule


@router.patch("/{id}", response_model=MoleculeResponse)
def update_molecule(
    id: str,
    data: MoleculeUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    molecule = crud.get_molecule(db, id)
    if not molecule or molecule.job_bundle.user_id != user.id:
        raise HTTPException(status_code=404, detail="Molecule not found")
    return crud.update_molecule(db, molecule, data)


@router.delete("/{id}", status_code=204)
def delete_molecule(
    id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    molecule = crud.get_molecule(db, id)
    if not molecule or molecule.job_bundle.user_id != user.id:
        raise HTTPException(status_code=404, detail="Molecule not found")
    crud.delete_molecule(db, molecule)
