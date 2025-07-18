from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class JobBase(BaseModel):
    molecule_id: int
    gjf_path: str
    job_type: str  # SP, Opt, TD など


class JobCreate(JobBase):
    parent_job_id: Optional[str] = None


class JobUpdate(BaseModel):
    status: Optional[str] = None


class JobResponse(JobBase):
    id: int
    log_path: Optional[str]
    status: str
    submitted_at: datetime
    remote_job_id: Optional[str]
    parent_job_id: Optional[str]

    class Config:
        orm_mode = True
