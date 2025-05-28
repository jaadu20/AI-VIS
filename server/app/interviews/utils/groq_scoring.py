import requests
import json
from django.conf import settings

class GroqScoringService:
    API_URL = "https://api.groq.com/openai/v1/chat/completions"
    
    def __init__(self):
        self.headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
    
    def score_answer(self, question, answer):
        """Score candidate's answer on a scale of 0-10"""
        prompt = f"""
        As an expert interviewer, analyze the candidate's answer to the interview question.
        Provide a score between 0-10 based on relevance, completeness, and professionalism.
        Return ONLY the numerical score without any additional text.
        
        Question: {question}
        Answer: {answer}
        """
        
        payload = {
            "model": "llama3-70b-8192",
            "messages": [
                {"role": "system", "content": "You are an expert interviewer scoring candidate answers."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.0,
            "max_tokens": 3
        }
        
        response = requests.post(self.API_URL, headers=self.headers, json=payload)
        response.raise_for_status()
        
        try:
            score_text = response.json()["choices"][0]["message"]["content"].strip()
            return int(score_text)
        except (ValueError, KeyError):
            return 5  # Default score if parsing fails