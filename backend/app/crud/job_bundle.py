from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.job_bundle import JobBundle
from app.schemas.job_bundle import JobBundleCreate, JobBundleUpdate
from datetime import datetime, timezone
import uuid
from typing import Any


async def create_bundle(
    db: AsyncSession, data: JobBundleCreate, user_id: Any
) -> JobBundle:
    bundle = JobBundle(
        name=data.name, user_id=user_id, calc_settings=data.calc_settings
    )
    db.add(bundle)
    await db.commit()
    await db.refresh(bundle)
    return bundle


async def get_all_bundles_by_user(db: AsyncSession, user_id: Any):
    result = await db.execute(select(JobBundle).where(JobBundle.user_id == user_id))
    return result.scalars().all()


async def get_bundle_by_id(db: AsyncSession, bundle_id: int) -> JobBundle | None:
    result = await db.execute(select(JobBundle).where(JobBundle.id == bundle_id))
    return result.scalars().first()


async def get_bundles_by_user(db: AsyncSession, user_id: int) -> list[JobBundle]:
    result = await db.execute(select(JobBundle).where(JobBundle.user_id == user_id))
    bundles = result.scalars().all()
    return list(bundles)


async def update_bundle(
    db: AsyncSession, bundle: JobBundle, data: JobBundleUpdate
) -> JobBundle:
    for field, value in data.dict(exclude_unset=True).items():
        setattr(bundle, field, value)
    await db.commit()
    await db.refresh(bundle)
    return bundle


async def delete_bundle(db: AsyncSession, bundle: JobBundle):
    await db.delete(bundle)
    await db.commit()
