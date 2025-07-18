from sqlalchemy.orm import Session
from app.models.molecule import Molecule
from app.schemas.molecule import MoleculeCreate, MoleculeUpdate
import uuid
from datetime import datetime


def create_molecule(db: Session, data: MoleculeCreate) -> Molecule:
    mol = Molecule(**data.dict())
    db.add(mol)
    db.commit()
    db.refresh(mol)
    return mol


def get_molecule(db: Session, mol_id: int) -> Molecule | None:
    return db.query(Molecule).filter(Molecule.id == mol_id).first()


def get_molecules_by_bundle(db: Session, bundle_id: int) -> list[Molecule]:
    return db.query(Molecule).filter(Molecule.bundle_id == bundle_id).all()


def get_all_molecules_by_user(db: Session, user_id: int):
    return (
        db.query(Molecule)
        .join(Molecule.job_bundle)
        .filter(Molecule.job_bundle.user_id == user_id)
        .all()
    )


def update_molecule(db: Session, molecule: Molecule, data: MoleculeUpdate) -> Molecule:
    for field, value in data.dict(exclude_unset=True).items():
        setattr(molecule, field, value)
    db.commit()
    db.refresh(molecule)
    return molecule


def delete_molecule(db: Session, molecule: Molecule):
    db.delete(molecule)
    db.commit()
