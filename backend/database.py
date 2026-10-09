from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base ,sessionmaker

#Store database in our backend folder
DATABASE_PATH = Path(__file__).resolve().parent / "urls.db"

DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

#Create a database engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Required for SQLite
)
#Create a session 
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

#Base class for our models
Base = declarative_base()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()