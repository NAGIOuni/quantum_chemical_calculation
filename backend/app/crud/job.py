from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models import Job, Molecule, JobBundle
from app.schemas.job import JobCreate
from datetime import datetime, timezone
import uuid
from typing import Any


async def create_job(db: AsyncSession, data: JobCreate) -> Job:
    job = Job(**data.dict())
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job


async def get_job(db: AsyncSession, job_id: int) -> Job:
    result = await db.execute(
        select(Job)
        .options(selectinload(Job.molecule).selectinload(Job.molecule.job_bundle))
        .where(Job.id == job_id)
    )
    return result.scalars().first()


async def get_jobs_by_user(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(Job)
        .join(Molecule, Job.molecule_id == Molecule.id)
        .join(JobBundle, Molecule.bundle_id == JobBundle.id)
        .options(selectinload(Job.molecule).selectinload(Molecule.job_bundle))
        .where(JobBundle.user_id == user_id)
    )
    return result.scalars().all()


async def get_job_by_id(db: AsyncSession, job_id: int) -> Job | None:
    result = await db.execute(select(Job).where(Job.id == job_id))
    return result.scalars().first()


async def get_jobs_by_molecule(db: AsyncSession, molecule_id: int) -> list[Job]:
    result = await db.execute(select(Job).where(Job.molecule_id == molecule_id))
    jobs = result.scalars().all()
    return list(jobs)


async def update_job_status(db: AsyncSession, job: Job, status: str) -> Job:
    job.status = status  # type: ignore
    await db.commit()
    await db.refresh(job)
    return job


async def delete_job(db: AsyncSession, job: Job):
    await db.delete(job)
    await db.commit()
