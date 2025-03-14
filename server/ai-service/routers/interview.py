from fastapi import APIRouter, WebSocket
from transformers import pipeline

router = APIRouter()
question_generator = pipeline("text2text-generation", model="t5-small")

@router.websocket("/interview/{job_id}")
async def interview_websocket(websocket: WebSocket):
    await websocket.accept()
    job_desc = await websocket.receive_text()
    
    # Generate initial questions
    questions = question_generator(
        f"generate interview questions about: {job_desc}", 
        max_length=100
    )
    
    await websocket.send_text(questions[0]['generated_text'])