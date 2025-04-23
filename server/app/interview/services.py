import requests
import json
from django.conf import settings

class GrokAIService:
    @staticmethod
    def generate_question(job_description, previous_answer, difficulty_level):
        prompts = {
            'easy': [
                f"Based on the job description: {job_description}, ask a basic question about required skills.",
                f"Considering the candidate's previous answer: {previous_answer}, ask a fundamental follow-up question.",
                f"Ask a straightforward question related to {job_description} for a junior level candidate."
            ],
            'medium': [
                f"Generate a scenario-based question related to {job_description}",
                f"Ask a technical question that requires problem-solving skills for {job_description}",
                f"Create a behavioral question based on the job requirements: {job_description}"
            ],
            'hard': [
                f"Generate a complex technical challenge specific to {job_description}",
                f"Ask a high-pressure scenario question for a senior candidate applying for {job_description}",
                f"Create a critical thinking question that tests deep knowledge of {job_description}"
            ]
        }
        
        # Simulated Grok API call (replace with actual API call)
        prompt = prompts[difficulty_level]
        response = requests.post(
            "https://api.groq.ai/v1/generate",
            headers={"Authorization": f"Bearer {settings.GROK_API_KEY}"},
            json={
                "prompt": prompt,
                "max_tokens": 100
            }
        )
        return response.json().get('text', 'Could not generate question')

    @staticmethod
    def analyze_answer(question, answer, job_description):
        # Simulated analysis API call
        response = requests.post(
            "https://api.grok.ai/v1/analyze",
            headers={"Authorization": f"Bearer {settings.GROK_API_KEY}"},
            json={
                "question": question,
                "answer": answer,
                "context": job_description
            }
        )
        return response.json()