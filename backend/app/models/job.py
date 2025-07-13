from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import Base
from datetime import datetime, timezone
import uuid


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    molecule_id = Column(String, ForeignKey("molecules.id"), nullable=False)
    gaussian_job_id = Column(String(100))
    status = Column(String(50), nullable=False)
    remote_job_dir_path = Column(String(512), nullable=False)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    error_message = Column(Text)
    last_log_update_at = Column(DateTime(timezone=True))
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    molecule = relationship("Molecule", back_populates="jobs")
    summary_result = relationship(
        "JobSummaryResult", back_populates="job", uselist=False
    )
