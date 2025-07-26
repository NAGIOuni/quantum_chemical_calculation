from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models import Molecule, JobBundle
from app.schemas.molecule import MoleculeCreate, MoleculeUpdate
import uuid
from datetime import datetime
from typing import Any


async def create_molecule(db: AsyncSession, data: MoleculeCreate) -> Molecule:
    mol = Molecule(**data.dict())
    db.add(mol)
    await db.commit()
    await db.refresh(mol)
    return mol


async def get_molecule(db: AsyncSession, mol_id: int) -> Molecule | None:
    result = await db.execute(select(Molecule).where(Molecule.id == mol_id))
    return result.scalars().first()


async def get_molecules_by_bundle(db: AsyncSession, bundle_id: int) -> list[Molecule]:
    result = await db.execute(select(Molecule).where(Molecule.bundle_id == bundle_id))
    mols = result.scalars().all()
    return list(mols)


async def get_all_molecules_by_user(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(Molecule)
        .join(JobBundle, Molecule.bundle_id == JobBundle.id)
        .where(JobBundle.user_id == user_id)
    )
    return result.scalars().all()


async def update_molecule(
    db: AsyncSession, molecule: Molecule, data: MoleculeUpdate
) -> Molecule:
    for field, value in data.dict(exclude_unset=True).items():
        setattr(molecule, field, value)
    await db.commit()
    await db.refresh(molecule)
    return molecule


async def delete_molecule(db: AsyncSession, molecule: Molecule):
    await db.delete(molecule)
    await db.commit()
