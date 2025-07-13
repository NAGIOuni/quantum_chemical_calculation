from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, SmallInteger
from sqlalchemy.orm import relationship
from app.models.base import Base
from datetime import datetime, timezone
import uuid


class Molecule(Base):
    __tablename__ = "molecules"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_bundle_id = Column(String, ForeignKey("job_bundles.id"), nullable=False)
    name = Column(String(255), nullable=False)
    charge = Column(SmallInteger, nullable=False)
    multiplicity = Column(SmallInteger, nullable=False)
    atom_count = Column(Integer, nullable=False)
    local_gjf_path = Column(String(512), nullable=False)
    input_xyz_coords = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    job_bundle = relationship("JobBundle", back_populates="molecules")
    jobs = relationship("Job", back_populates="molecule")
