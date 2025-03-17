from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch
from sqlalchemy.orm import Session
from question_generation.models.database import JobPosting
from question_generation.config import settings

class QuestionGenerator:
    def __init__(self, db: Session):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = T5ForConditionalGeneration.from_pretrained(settings.model_name)
        
        # Set explicit model_max_length to avoid warning
        self.tokenizer = T5Tokenizer.from_pretrained(settings.model_name, model_max_length=512, legacy=False)
        
        self.db = db
        self.model.to(self.device)
    
    def get_job_description(self, job_id: int):
        return self.db.query(JobPosting).filter(JobPosting.id == job_id).first().description
    
    def generate_questions(self, job_id: int, difficulty: str = "easy"):
        job_desc = self.get_job_description(job_id)
        if not job_desc:
            raise ValueError("Job description not found for the given job_id")
        else:
            prompt = f"Generate {difficulty} level technical interview questions about: {job_desc}"
            
            inputs = self.tokenizer.encode(prompt, return_tensors="pt").to(self.device)
            outputs = self.model.generate(
                inputs,
                max_length=256,
                num_beams=5,
                num_return_sequences=settings.initial_questions,
                early_stopping=True
            )
        
        return [self.tokenizer.decode(output, skip_special_tokens=True) for output in outputs]