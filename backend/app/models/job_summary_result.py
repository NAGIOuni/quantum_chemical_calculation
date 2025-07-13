from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.models.base import Base
import uuid


class JobSummaryResult(Base):
    __tablename__ = "job_summary_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String, ForeignKey("jobs.id"), unique=True, nullable=False)
    final_energy_hartree = Column(Numeric(18, 10))
    final_energy_zpe_hartree = Column(Numeric(18, 10))
    final_energy_h_hartree = Column(Numeric(18, 10))
    final_energy_g_hartree = Column(Numeric(18, 10))
    homo_energy_ev = Column(Numeric(10, 5))
    lumo_energy_ev = Column(Numeric(10, 5))
    band_gap_ev = Column(Numeric(10, 5))
    lowest_excitation_energy_ev = Column(Numeric(10, 5))
    lowest_oscillator_strength = Column(Numeric(10, 5))
    extracted_at = Column(DateTime(timezone=True))

    job = relationship("Job", back_populates="summary_result")
