from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import interview, voice, facial

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(interview.router)
app.include_router(voice.router)
app.include_router(facial.router)