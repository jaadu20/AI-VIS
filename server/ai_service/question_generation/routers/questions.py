from fastapi import APIRouter, Depends
from ..schemas.questions import QuestionRequest, FollowupRequest
from ..services.generation import QuestionService

router = APIRouter(prefix="/questions", tags=["Question Generation"])
service = QuestionService()

@router.post("/initial")
async def generate_initial_questions(request: QuestionRequest):
    return {"questions": service.get_initial_questions(request)}

@router.post("/followup")
async def generate_followup_question(request: FollowupRequest):
    return {"question": service.get_followup_question(request)}