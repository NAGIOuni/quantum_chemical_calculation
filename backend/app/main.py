from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase.client import create_client, Client
from dotenv import load_dotenv
from app.api import user, auth, molecule, job_bundle, job, server_credential
import uvicorn
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URLまたはSUPABASE_KEYが設定されていません")
else:
    print("supabaseと接続できています")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(molecule.router, prefix="/molecules", tags=["molecules"])
app.include_router(job_bundle.router, prefix="/bundles", tags=["job_bundles"])
app.include_router(job.router, prefix="/jobs", tags=["jobs"])
app.include_router(
    server_credential.router, prefix="/credentials", tags=["server_credentials"]
)
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"message": "Hello World"}


@app.get("/api/data")
async def get_data():
    return {"data": "これはFastAPIから提供されるデータです！"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")
