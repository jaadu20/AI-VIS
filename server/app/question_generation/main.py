from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from services.question_generator import QuestionGenerator
from models.database import InterviewSession, JobPosting, SessionLocal
from services.evaluator import AnswerEvaluator
from config import settings
from datetime import datetime
from pydantic import BaseModel
import uuid

app = FastAPI()

# Database Dependenc
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# @app.post("/interviews/start/{job_id}")
# def start_interview(job_id: int, db: Session = Depends(get_db)):
#     try:
#         qg = QuestionGenerator(db)
#         evaluator = AnswerEvaluator()
        
#         # Generate initial questions
#         questions = qg.generate_questions(job_id)
        
#         # Create interview session
#         session_id = str(uuid.uuid4())
#         db.add(InterviewSession(
#             id=session_id,
#             job_id=job_id,
#             questions=questions,
#             difficulty_level="easy"
#         ))
#         db.commit()
        
#         return {"session_id": session_id, "questions": questions}
    
#     except Exception as e:
#         db.rollback()  # Rollback in case of error
#         raise HTTPException(status_code=500, detail=str(e))

@app.post("/interviews/start/{job_id}")
def start_interview(job_id: int, db: Session = Depends(get_db)):
    try:
        # Check if job exists
        job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job posting not found")
        
        qg = QuestionGenerator(db)
        evaluator = AnswerEvaluator()
        
        # Generate initial questions
        questions = qg.generate_questions(job.id) 
        
        # Create interview session
        session_id = str(uuid.uuid4())
        db.add(InterviewSession(
            id=session_id,
            job_id=job_id,
            questions=questions,
            difficulty_level="easy"
        ))
        db.commit()
        
        return {"session_id": session_id, "questions": questions}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# @app.post("/jobs/")
# def create_job(title: str, description: str, requirements: dict, db: Session = Depends(get_db)):
#     job = JobPosting(
#         title=title,
#         description=description,
#         requirements=requirements
#     )
#     db.add(job)
#     db.commit()
#     db.refresh(job)
#     return job

# SQLAlchemy model
class JobCreate(BaseModel):
    title: str
    description: str
    requirements: dict

# Pydantic schema for response
class JobResponse(JobCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

@app.post("/jobs/", response_model=JobResponse)
def create_job(job_data: JobCreate, db: Session = Depends(get_db)):
    job = JobPosting(
        title=job_data.title,
        description=job_data.description,
        requirements=job_data.requirements
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@app.post("/interviews/{session_id}/answer")
def submit_answer(session_id: str, answer: str, db: Session = Depends(get_db)):
    try:
        evaluator = AnswerEvaluator()
        session = db.query(InterviewSession).filter_by(id=session_id).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Interview session not found")
        
        # Evaluate answer
        current_question = session.questions[len(session.answers or [])]
        score = evaluator.evaluate(current_question, answer)
        
        # Update session
        session.answers = (session.answers or []) + [answer]
        session.scores = (session.scores or []) + [score]
        
        # Generate next question if needed
        if len(session.answers) < settings.max_questions:
            difficulty = evaluator.adjust_difficulty(session.scores)
            qg = QuestionGenerator(db)
            next_question = qg.generate_questions(
                session.job_id, 
                difficulty
            )[0]
            
            session.questions.append(next_question)
            session.difficulty_level = difficulty
            db.commit()
            
            return {"next_question": next_question}
        
        db.commit()
        return {"status": "Interview completed"}
    
    except Exception as e:
        db.rollback()  # Rollback in case of error
        raise HTTPException(status_code=500, detail=str(e))