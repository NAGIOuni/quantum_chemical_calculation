from sqlalchemy import Column, String, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class Molecule(Base):
    __tablename__ = "molecules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    charge = Column(Integer, nullable=False)
    multiplicity = Column(Integer, nullable=False)
    structure_xyz = Column(Text, nullable=False)
    bundle_id = Column(Integer, ForeignKey("job_bundles.id"), nullable=False)
    latest_job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)

    jobs = relationship(
        "Job",
        foreign_keys="[Job.molecule_id]",
        back_populates="molecule",
        cascade="all, delete-orphan",
    )
    latest_job = relationship(
        "Job", foreign_keys=[latest_job_id], backref="latest_for_molecules"
    )
    job_bundle = relationship("JobBundle", back_populates="molecules")
