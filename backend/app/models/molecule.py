import uuid
from sqlalchemy import Column, String, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class Molecule(Base):
    __tablename__ = "molecules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    charge = Column(Integer, nullable=False)
    multiplicity = Column(Integer, nullable=False)
    structure_xyz = Column(Text, nullable=False)
    bundle_id = Column(UUID(as_uuid=True), ForeignKey("job_bundles.id"), nullable=False)
    latest_job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=True)

    job_bundle = relationship("JobBundle", backref="molecules")
    latest_job = relationship(
        "Job", foreign_keys=[latest_job_id], backref="latest_for_molecules"
    )
