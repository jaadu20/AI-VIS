# interviews/services.py
import json
import tempfile
from django.conf import settings
from azure.cognitiveservices.speech import (
    AudioConfig, SpeechConfig, SpeechSynthesizer, SpeechRecognizer,
    ResultReason, CancellationReason
)
from groq import Groq
from .models import Answer, Question
class AzureSpeechService:
    def __init__(self):
        self.speech_config = SpeechConfig(
            subscription=settings.AZURE_SPEECH_KEY,
            region=settings.AZURE_SPEECH_REGION
        )
        self.speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
        self.speech_config.speech_recognition_language = "en-US"

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
                return None
        except Exception as e:
            raise RuntimeError(f"TTS failed: {str(e)}")

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
                elif result.reason == ResultReason.NoMatch:
                    raise RuntimeError("No speech detected")
                elif result.reason == ResultReason.Canceled:
                    cancellation = result.cancellation_details
                    raise RuntimeError(f"Recognition canceled: {cancellation.reason}")
                return ""
        except Exception as e:
            raise RuntimeError(f"STT failed: {str(e)}")

class GroqQuestionGenerator:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.system_prompt = """You are an expert technical interviewer. Generate relevant interview questions based on:
        - Job description and requirements
        - Candidate's previous answers
        - Current interview difficulty level
        
        Return JSON format: {"question": "...", "difficulty": "easy|medium|hard"}"""

    def generate_question(self, context: str, difficulty: str) -> dict:
        try:
            response = self.client.chat.completions.create(
                model="llama3-70b-8192",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": f"Context:\n{context}\nGenerate a {difficulty} difficulty question:"}
                ],
                temperature=0.7,
                max_tokens=256,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            return {"question": f"Could not generate question: {str(e)}", "difficulty": difficulty}

class GroqAnswerAnalyzer:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.system_prompt = """Analyze interview answers based on:
        - Technical accuracy
        - Relevance to question
        - Communication clarity
        - Problem-solving approach
        Return JSON format: {"score": 0-10, "feedback": "..."}"""

    def analyze_answer(self, question: str, answer: str) -> dict:
        try:
            response = self.client.chat.completions.create(
                model="llama3-70b-8192",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": f"Question: {question}\nAnswer: {answer}"}
                ],
                temperature=0.5,
                max_tokens=200,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            return {"score": 5.0, "feedback": f"Analysis failed: {str(e)}"}

class InterviewManager:
    def __init__(self, interview):
        self.interview = interview
        self.question_generator = GroqQuestionGenerator()
        self.answer_analyzer = GroqAnswerAnalyzer()

    def generate_initial_questions(self) -> list:
        job = self.interview.application.job
        return [
            {
                "text": f"Welcome to your interview for {job.title} at {job.company_name}. "
                        "We'll begin with some general questions before moving to technical ones.",
                "difficulty": "easy",
                "order": 0,
                "is_predefined": True
            },
            {
                "text": "Walk us through your resume and highlight relevant experience for this role.",
                "difficulty": "easy",
                "order": 1,
                "is_predefined": True
            }
        ]

    def generate_next_question(self) -> dict:
        context = self._build_context()
        difficulty = self._calculate_difficulty()
        return self.question_generator.generate_question(context, difficulty)

    def analyze_answer(self, question: Question, answer: str) -> dict:
        analysis = self.answer_analyzer.analyze_answer(question.text, answer)
        question.answer_score = analysis['score']
        question.save()
        self.interview.total_score += analysis['score']
        self.interview.save()
        return analysis

    def _build_context(self) -> str:
        job = self.interview.application.job
        answers = Answer.objects.filter(question__interview=self.interview)
        return f"""
        Job Title: {job.title}
        Company: {job.company_name}
        Requirements: {job.requirements}
        Description: {job.description}
        Previous Answers: {[a.text for a in answers]}
        Current Difficulty: {self.interview.difficulty}
        """

    def _calculate_difficulty(self) -> str:
        avg_score = self.interview.total_score / (self.interview.current_question or 1)
        if avg_score > 8.0:
            return 'hard'
        elif avg_score > 6.0:
            return 'medium'
        return 'easy'