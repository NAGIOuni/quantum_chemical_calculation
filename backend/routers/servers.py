from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_servers():
    return {"message": "aoerigha;oeirjf"}
