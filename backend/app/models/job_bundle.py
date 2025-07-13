from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Numeric
from sqlalchemy.orm import relationship
from app.models.base import Base
from datetime import datetime, timezone
import uuid


class JobBundle(Base):
    __tablename__ = "job_bundles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    calc_type_name = Column(String(50), nullable=False)
    theory_level = Column(String(50), nullable=False)
    basis_set = Column(String(50), nullable=False)
    solvent_model = Column(String(50))
    solvent_name = Column(String(50))
    mem_gb = Column(Numeric(5, 2))
    nproc_shared = Column(Integer)
    additional_keywords = Column(Text)
    status = Column(String(50), nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="job_bundles")
    molecules = relationship("Molecule", back_populates="job_bundle")
