from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import os

from app.dependencies import get_db, get_current_user
from app.models import JobBundle, Molecule, User
from app.schemas.upload import GJFUploadResult
from app.utils.gjf_parser import parse_gjf
import app.crud.molecule as crud_molecule

router = APIRouter(prefix="/bundles", tags=["gjf_upload"])


@router.post("/{bundle_id}/upload-gjf", response_model=List[GJFUploadResult])
async def upload_gjf_files(
    bundle_id: int,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    job_bundle = db.execute(select(JobBundle).where(JobBundle.id == bundle_id))
    if not job_bundle or job_bundle.user_id != user.id:  # type: ignore
        raise HTTPException(status_code=404, detail="JobBundle not found")

    results = []
    filenames = set()

    for file in files:
        result = {"name": file.filename, "status": "success"}
        if file.filename in filenames:
            result["status"] = "error"
            result["error_message"] = "ファイル名が重複しています"
            results.append(result)
            continue
        filenames.add(file.filename)

        content = await file.read()
        try:
            parsed = parse_gjf(content.decode())
            molecule = await crud_molecule.create_molecule(
                db,
                crud_molecule.MoleculeCreate(
                    name=file.filename,  # type: ignore
                    charge=parsed["charge"],
                    multiplicity=parsed["multiplicity"],
                    structure_xyz=parsed["structure_xyz"],
                    bundle_id=bundle_id,
                ),
            )
            result.update(parsed)
        except Exception as e:
            result["status"] = "error"
            result["error_message"] = str(e)

        results.append(result)

    return results
