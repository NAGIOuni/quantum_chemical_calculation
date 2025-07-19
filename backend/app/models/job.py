from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from .base import Base


class JobStatus(str, enum.Enum):
    queued = "queued"
    running = "running"
    done = "done"
    error = "error"
    cancelled = "cancelled"


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    molecule_id = Column(Integer, ForeignKey("molecules.id"), nullable=False)
    gjf_path = Column(String(512), nullable=False)
    log_path = Column(String(512), nullable=True)
    job_type = Column(String(20), nullable=False)
    status = Column(Enum(JobStatus), nullable=False)
    submitted_at = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))
    remote_job_id = Column(String(100), nullable=True)
    parent_job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)

    molecule = relationship(
        "Molecule", foreign_keys=[molecule_id], back_populates="jobs", uselist=False
    )
    parent_job = relationship("Job", remote_side=[id], backref="child_jobs")
