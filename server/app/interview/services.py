# interviews/services.py
import json
import requests
import tempfile
from typing import Dict, Any
from django.conf import settings
from azure.cognitiveservices.speech import (
    SpeechConfig, SpeechSynthesizer, SpeechRecognizer,
    AudioConfig, ResultReason
)

class InterviewManager:
    def __init__(self, interview):
        self.interview = interview
        self.speech_service = AzureSpeechService()
        self.question_generator = GroqQuestionGenerator()
        self.answer_analyzer = GroqAnswerAnalyzer()

    def generate_questions(self):
        # Generate initial questions
        questions = []
        
        # AI Introduction
        intro = (
            f"Welcome to your interview for {self.interview.application.job.title} at "
            f"{self.interview.application.job.company_name}. Let's begin!"
        )
        questions.append({
            'text': intro,
            'order': 0,
            'is_predefined': True,
            'difficulty': 'easy'
        })

        # First predefined question
        questions.append({
            'text': "Tell me about your relevant experience for this role",
            'order': 1,
            'is_predefined': True,
            'difficulty': 'easy'
        })

        # Generate dynamic questions
        for i in range(2, 15):
            prev_answers = self.interview.questions.filter(order__lt=i)
            context = self._build_context()
            difficulty = self._calculate_difficulty(prev_answers)
            
            question = self.question_generator.generate_question(
                context=context,
                previous_answers=prev_answers,
                difficulty=difficulty
            )
            
            questions.append({
                'text': question['text'],
                'order': i,
                'difficulty': difficulty,
                'is_predefined': False
            })

        return questions

    def _build_context(self):
        job = self.interview.application.job
        return (
            f"Job Title: {job.title}\n"
            f"Requirements: {job.requirements}\n"
            f"Description: {job.description}\n"
            f"Required Skills: {self.interview.application.skills_matched}"
        )

    def _calculate_difficulty(self, prev_answers):
        avg_score = sum([q.answer_score for q in prev_answers if q.answer_score]) / len(prev_answers) if prev_answers else 0
        if avg_score > 7:
            return 'hard'
        elif avg_score > 5:
            return 'medium'
        return 'easy'
    
class AzureSpeechService:
    def __init__(self):
        self.speech_config = SpeechConfig(
            subscription=settings.AZURE_SPEECH_KEY,
            region=settings.AZURE_SPEECH_REGION
        )
        self.speech_config.speech_recognition_language = "en-US"
        self.speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"

    def text_to_speech(self, text: str) -> bytes:
        try:
            with tempfile.NamedTemporaryFile() as tmpfile:
                audio_config = AudioConfig(filename=tmpfile.name)
                synthesizer = SpeechSynthesizer(
                    speech_config=self.speech_config,
                    audio_config=audio_config
                )
                result = synthesizer.speak_text_async(text).get()
                if result.reason == ResultReason.SynthesizingAudioCompleted:
                    return tmpfile.read()
        except Exception as e:
            print(f"TTS Error: {str(e)}")
        return None

    def speech_to_text(self, audio_data: bytes) -> str:
        try:
            with tempfile.NamedTemporaryFile() as tmpfile:
                tmpfile.write(audio_data)
                audio_config = AudioConfig(filename=tmpfile.name)
                recognizer = SpeechRecognizer(
                    speech_config=self.speech_config,
                    audio_config=audio_config
                )
                result = recognizer.recognize_once_async().get()
                if result.reason == ResultReason.RecognizedSpeech:
                    return result.text
        except Exception as e:
            print(f"STT Error: {str(e)}")
        return None

class GroqQuestionGenerator:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def generate_question(self, context: str, previous_answers: list, difficulty: str) -> Dict[str, Any]:
        prompt = f"""Generate a {difficulty} difficulty technical interview question based on:
        {context}
        Previous answers: {json.dumps(previous_answers)}
        Return JSON with 'question' and 'difficulty' fields."""
        
        payload = {
            "model": "llama3-70b-8192",
            "messages": [{
                "role": "system",
                "content": "You are a technical interviewer generating job-specific questions."
            }, {
                "role": "user",
                "content": prompt
            }],
            "temperature": 0.7,
            "max_tokens": 300
        }
        
        try:
            response = requests.post(self.api_url, headers=self.headers, json=payload)
            response.raise_for_status()
            return json.loads(response.json()["choices"][0]["message"]["content"])
        except Exception as e:
            return {"question": f"Question generation failed: {str(e)}", "difficulty": difficulty}
        
class GroqAnswerAnalyzer:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def analyze_answer(self, question: str, answer: str) -> float:
        prompt = f"""Analyze this interview answer and give a score 0-10:
        Question: {question}
        Answer: {answer}
        
        Consider:
        - Relevance to question
        - Technical accuracy
        - Communication clarity
        - Depth of knowledge
        
        Return JSON with 'score' and 'feedback' fields."""
        
        payload = {
            "model": "llama3-70b-8192",
            "messages": [{
                "role": "system",
                "content": "You are an expert interview answer evaluator."
            }, {
                "role": "user",
                "content": prompt
            }],
            "temperature": 0.5,
            "max_tokens": 200
        }
        
        try:
            response = requests.post(self.api_url, headers=self.headers, json=payload)
            response.raise_for_status()
            result = json.loads(response.json()["choices"][0]["message"]["content"])
            return float(result['score'])
        except Exception as e:
            return 5.0  # Default average score on error