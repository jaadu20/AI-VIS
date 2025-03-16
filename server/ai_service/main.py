from fastapi import FastAPI
from ai_service.question_generation.routers import questions

app = FastAPI()

app.include_router(questions.router)

@app.get("/")
def read_root():
    return {"message": "AI-VIS Question Generation API"}