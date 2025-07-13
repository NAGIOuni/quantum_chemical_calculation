from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

path = "postgresql://postgres.cfzavxtsbztzpsnvmpny:H$CA285g.c+sNw$@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

Engine = create_engine(path, encoding="utf-8", echo=False)
Base = declarative_base()
