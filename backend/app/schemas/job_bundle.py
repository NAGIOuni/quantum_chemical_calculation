from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class JobBundleBase(BaseModel):
    name: str
    calc_settings: Optional[dict] = None  # JSON型


class JobBundleCreate(JobBundleBase):
    pass


class JobBundleUpdate(BaseModel):
    name: Optional[str] = None
    calc_settings: Optional[dict] = None


class JobBundleResponse(JobBundleBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        orm_mode = True
