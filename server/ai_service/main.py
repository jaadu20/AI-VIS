from fastapi import FastAPI
from ai_service.question_generation.routers import questions
from ai_service.question_generation.models.t5_generator import T5QuestionGenerator

# Add this before creating FastAPI app
print("Warming up model...")
T5QuestionGenerator().generate("warmup")
print("Model ready!")

app = FastAPI()

app.include_router(questions.router)

@app.get("/")
def read_root():
    return {"message": "AI-VIS Question Generation API"}