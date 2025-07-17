from sqlalchemy.orm import Session
from models import JobBundle
from schemas.job_bundle import JobBundleCreate, JobBundleUpdate
from datetime import datetime, timezone
import uuid
from typing import Any


def create_bundle(db: Session, user_id: Any, data: JobBundleCreate) -> JobBundle:
    bundle = JobBundle(
        id=str(uuid.uuid4()),
        name=data.name,
        calc_settings=data.calc_settings,
        user_id=user_id,
        created_at=datetime.now(timezone.utc),
    )
    db.add(bundle)
    db.commit()
    db.refresh(bundle)
    return bundle


def get_all_bundles_by_user(db: Session, user_id: Any):
    return db.query(JobBundle).filter(JobBundle.user_id == user_id).all()


def get_bundle_by_id(db: Session, bundle_id: Any):
    return db.query(JobBundle).filter(JobBundle.id == bundle_id).first()


def update_bundle(db: Session, bundle: JobBundle, data: JobBundleUpdate) -> JobBundle:
    for field, value in data.dict(exclude_unset=True).items():
        setattr(bundle, field, value)
    db.commit()
    db.refresh(bundle)
    return bundle


def delete_bundle(db: Session, bundle: JobBundle):
    db.delete(bundle)
    db.commit()
