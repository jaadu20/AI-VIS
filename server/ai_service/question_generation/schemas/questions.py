from pydantic import BaseModel

class QuestionRequest(BaseModel):
    job_description: str
    num_questions: int = 3
    difficulty: str = "medium"

class FollowupRequest(BaseModel):
    previous_questions: list[str]
    answers: list[str]
    scores: list[float]
    job_description: str