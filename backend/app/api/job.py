from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.dependencies import get_db, get_current_user
from app.schemas.job import JobCreate, JobResponse, JobUpdate
from app.crud import job as crud
from app.models import Job, User
from app.utils.encryption import decrypt_text

import os

router = APIRouter()


@router.post("/", response_model=JobResponse)
async def create_job(
    data: JobCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # molecule 所有者確認など必要ならここで
    return await crud.create_job(db, data)


@router.get("/", response_model=List[JobResponse])
async def list_jobs(
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
):
    return await crud.get_jobs_by_user(db, user.id)  # type: ignore


@router.get("/{id}", response_model=JobResponse)
async def get_job(
    id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
):
    job = await crud.get_job(db, id)
    if not job or job.molecule.job_bundle.user_id != user.id:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.patch("/{id}", response_model=JobResponse)
async def update_job(
    id: int,
    data: JobUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    job = await crud.get_job(db, id)
    if not job or job.molecule.job_bundle.user_id != user.id:
        raise HTTPException(status_code=404, detail="Job not found")
    if data.status:
        job = await crud.update_job_status(db, job, data.status)
    return job


@router.delete("/{id}", status_code=204)
async def delete_job(
    id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
):
    job = await crud.get_job(db, id)
    if not job or job.molecule.job_bundle.user_id != user.id:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status not in ["queued", "error"]:
        raise HTTPException(
            status_code=400, detail="Cannot delete running or finished job"
        )
    await crud.delete_job(db, job)


@router.post("/{id}/cancel")
async def cancel_job(
    id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
):
    from services.job_execution import JobExecutionController
    from crud.job import update_job_status
    from models import ServerCredential

    job = await crud.get_job(db, id)
    if not job or job.molecule.job_bundle.user_id != user.id:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status not in ["queued", "running"]:
        raise HTTPException(status_code=400, detail="このジョブはキャンセルできません")

    if not job.remote_job_id:  # type: ignore
        raise HTTPException(status_code=400, detail="remote_job_id が未登録です")

    # 接続情報の取得（1件しか使わない前提）
    result = await db.execute(select(ServerCredential).limit(1))
    credential = result.scalars().first()
    if not credential:
        raise HTTPException(status_code=500, detail="ServerCredential が未登録です")

    try:
        controller = JobExecutionController(credential)
        controller.cancel_job(job.remote_job_id)  # type: ignore
        await update_job_status(db, job, "cancelled")
        return {"result": "cancelled"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"キャンセルに失敗しました: {str(e)}"
        )


@router.post("/{id}/relaunch", response_model=JobResponse)
async def relaunch_job(
    id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
):
    from services.job_execution import JobExecutionController
    from crud.job import create_job, update_job_status
    from models import ServerCredential

    old_job = await crud.get_job(db, id)
    if not old_job or old_job.molecule.job_bundle.user_id != user.id:
        raise HTTPException(status_code=404, detail="元ジョブが見つかりません")

    if not os.path.exists(old_job.gjf_path):  # type: ignore
        raise HTTPException(
            status_code=400, detail="元ジョブの .gjf ファイルが存在しません"
        )

    # 新しいジョブとして登録（parent_job_id に旧ジョブIDを指定）
    new_job_data = JobCreate(
        molecule_id=old_job.molecule_id,  # type: ignore
        gjf_path=old_job.gjf_path,  # type: ignore
        job_type=old_job.job_type,  # type: ignore
        parent_job_id=old_job.id,  # type: ignore
    )
    new_job = await create_job(db, new_job_data)

    # 接続情報取得
    result = await db.execute(select(ServerCredential).limit(1))
    credential = result.scalars().first()
    if not credential:
        raise HTTPException(status_code=500, detail="ServerCredential が未登録です")

    try:
        controller = JobExecutionController(credential)
        job_id = controller.submit_job(
            local_gjf_path=old_job.gjf_path,  # type: ignore
            remote_dir=os.path.dirname(
                old_job.log_path  # type: ignore
            ),  # log_path もしくは molecule/job_id で構成可
            filename="input.gjf",
        )
        new_job.remote_job_id = job_id  # type: ignore
        new_job.status = "running"  # type: ignore
        await db.commit()
        await db.refresh(new_job)
        return new_job
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"再投入に失敗しました: {str(e)}")


@router.get("/{id}/log")
async def get_job_log(
    id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
):
    from services.job_monitor import get_log_tail_via_ssh, get_job_status_via_qstat
    from services.job_execution import JobExecutionController
    from models import ServerCredential

    job = await crud.get_job(db, id)
    if not job or job.molecule.job_bundle.user_id != user.id:
        raise HTTPException(status_code=404, detail="ジョブが見つかりません")

    result = await db.execute(select(ServerCredential).limit(1))
    credential = result.scalars().first()
    if not credential:
        raise HTTPException(status_code=500, detail="接続情報が未設定です")

    host = credential.host
    usernm = credential.username
    password = decrypt_text(credential.password_encrypted)  # type: ignore
    log_path = job.log_path

    try:
        # ログ末尾取得
        log_tail = await get_log_tail_via_ssh(host, usernm, password, log_path)  # type: ignore
        is_complete = (
            "Normal termination" in log_tail or "Error termination" in log_tail
        )

        # qstatから状態取得
        remote_status = await get_job_status_via_qstat(
            host, usernm, password, job.remote_job_id or ""  # type: ignore
        )

        return {
            "log_content": log_tail,
            "is_complete": is_complete,
            "system_status": remote_status,
            "job_id": id,
            "remote_job_id": job.remote_job_id,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ログ取得に失敗しました: {str(e)}")
