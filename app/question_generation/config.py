from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    db_url: str = "postgresql://postgres:52-IsB_24@localhost:5432/aivisdb"
    model_name: str = "t5-base"
    initial_questions: int = 3
    max_questions: int = 10

settings = Settings()