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
            with tempfile.NamedTemporaryFile(delete=False) as tmpfile:
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
            with tempfile.NamedTemporaryFile(delete=False) as tmpfile:
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
        prompt = f"""Generate {difficulty} technical interview question based on:
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