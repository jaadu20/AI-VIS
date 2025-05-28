# services/scoring_service.py
import requests
from django.conf import settings
import json

class ScoringService:
    def __init__(self):
        self.grok_api_key = settings.GROK_API_KEY
        self.grok_api_url = "https://api.x.ai/v1/chat/completions"
    
    def score_answer(self, question: str, answer: str, difficulty: str) -> float:
        """Score an answer using Grok API"""
        
        scoring_prompt = f"""
You are an expert technical interviewer. Score the following interview answer on a scale of 1-10.

Consider these factors:
- Technical accuracy and correctness
- Completeness of the answer
- Clarity of explanation
- Relevance to the question
- Depth of understanding demonstrated

Question Difficulty: {difficulty.upper()}
Question: {question}
Answer: {answer}

Provide ONLY a numeric score from 1-10 (can include decimals like 7.5).
Do not include any explanation, just the number.
"""
        
        headers = {
            "Authorization": f"Bearer {self.grok_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messages": [
                {
                    "role": "system",
                    "content": "You are a technical interview scoring assistant. Respond only with numeric scores."
                },
                {
                    "role": "user", 
                    "content": scoring_prompt
                }
            ],
            "model": "grok-beta",
            "temperature": 0.3,
            "max_tokens": 10
        }
        
        try:
            response = requests.post(self.grok_api_url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            score_text = result['choices'][0]['message']['content'].strip()
            
            # Extract numeric score
            import re
            score_match = re.search(r'\d+\.?\d*', score_text)
            if score_match:
                score = float(score_match.group())
                return min(max(score, 1.0), 10.0)  # Ensure score is between 1-10
            else:
                return 5.0  # Default score if parsing fails
                
        except Exception as e:
            print(f"Scoring error: {e}")
            return 5.0  # Default score on error
    
    def determine_next_difficulty(self, current_score: float) -> str:
        """Determine next question difficulty based on current score"""
        if current_score >= 8.0:
            return "hard"
        elif current_score >= 6.0:
            return "medium"
        else:
            return "easy"