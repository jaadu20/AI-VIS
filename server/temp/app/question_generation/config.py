from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    db_url: str = "postgresql://postgres:52-IsB_24@localhost:5432/aivisdb"
    #model_name: str = "google-t5/t5-large"
    model_name = "meta-llama/Llama-3.1-8B"
    initial_questions: int = 3
    max_questions: int = 10

settings = Settings()