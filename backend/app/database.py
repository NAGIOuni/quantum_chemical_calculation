from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = "postgresql://postgres.cfzavxtsbztzpsnvmpny:H$CA285g.c+sNw$@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
