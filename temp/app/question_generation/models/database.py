from sqlalchemy import create_engine, Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker 
from datetime import datetime
from config import settings

Base = declarative_base()

class JobPosting(Base):
    __tablename__ = "job_postings"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    id = Column(String(36), primary_key=True)
    job_id = Column(Integer)
    questions = Column(JSON)
    answers = Column(JSON)
    scores = Column(JSON)
    difficulty_level = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)

# Initialize engine and session
engine = create_engine(settings.db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)  

# Create tables
Base.metadata.create_all(engine)