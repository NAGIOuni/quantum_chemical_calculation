from sqlalchemy.orm import Session
from models import Molecule
from schemas.molecule import MoleculeCreate, MoleculeUpdate
import uuid
from datetime import datetime


def create_molecule(db: Session, data: MoleculeCreate) -> Molecule:
    molecule = Molecule(
        id=uuid.uuid4(),
        name=data.name,
        charge=data.charge,
        multiplicity=data.multiplicity,
        structure_xyz=data.structure_xyz,
        bundle_id=data.bundle_id,
    )
    db.add(molecule)
    db.commit()
    db.refresh(molecule)
    return molecule


def get_molecule(db: Session, molecule_id: str) -> Molecule:
    return db.query(Molecule).filter(Molecule.id == molecule_id).first()


def get_all_molecules_by_user(db: Session, user_id: str):
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
