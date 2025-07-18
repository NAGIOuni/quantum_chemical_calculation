from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MoleculeBase(BaseModel):
    name: str
    charge: int
    multiplicity: int
    structure_xyz: str
    bundle_id: int


class MoleculeCreate(MoleculeBase):
    pass


class MoleculeUpdate(BaseModel):
    name: Optional[str] = None
    charge: Optional[int] = None
    multiplicity: Optional[int] = None
    structure_xyz: Optional[str] = None


class MoleculeResponse(MoleculeBase):
    id: int
    latest_job_id: Optional[str]

    class Config:
        orm_mode = True
