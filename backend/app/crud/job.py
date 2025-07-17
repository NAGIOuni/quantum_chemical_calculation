from sqlalchemy.orm import Session
from app.models.job import Job
from app.schemas.job import JobCreate
from datetime import datetime, timezone
import uuid
from typing import Any


def create_job(db: Session, data: JobCreate) -> Job:
    job = Job(
        id=str(uuid.uuid4()),
        molecule_id=data.molecule_id,
        gjf_path=data.gjf_path,
        log_path=None,
        job_type=data.job_type,
        status="queued",
        submitted_at=datetime.now(timezone.utc),
        parent_job_id=data.parent_job_id,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def get_job(db: Session, job_id: str) -> Job:
    return db.query(Job).filter(Job.id == job_id).first()


def get_jobs_by_user(db: Session, user_id: Any):
    return (
        db.query(Job)
        .join(Job.molecule)
        .join(Job.molecule.job_bundle)
        .filter(Job.molecule.job_bundle.user_id == user_id)
        .all()
    )


def update_job_status(db: Session, job: Job, status: str) -> Job:
    job.status = status  # type: ignore
    db.commit()
    db.refresh(job)
    return job


def delete_job(db: Session, job: Job):
    db.delete(job)
    db.commit()
