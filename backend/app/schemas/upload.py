from pydantic import BaseModel
from typing import List


class GJFUploadResult(BaseModel):
    name: str
    charge: int
    multiplicity: int
    structure_xyz: str
    status: str  # success or error
    error_message: str | None = None
