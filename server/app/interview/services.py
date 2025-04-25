# interviews/services.py
import json
import requests
import tempfile,os
from typing import Dict, Any, Optional
from django.conf import settings
from azure.cognitiveservices.speech import (
    SpeechConfig,
    SpeechSynthesizer,
    SpeechRecognizer,
    AudioConfig,
    ResultReason
)

class AzureSpeechService:
    def __init__(self):
        self.speech_config = SpeechConfig(
            subscription=os.environ.get("AZURE_SPEECH_KEY", settings.AZURE_SPEECH_KEY),
            region=os.environ.get("AZURE_SPEECH_REGION", settings.AZURE_SPEECH_REGION)
        )
        self.speech_config.speech_recognition_language = "en-US"
        self.speech_config.speech_synthesis_language = "en-US"
        self.speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"

    def text_to_speech(self, text: str) -> Optional[bytes]:
        try:
            with tempfile.NamedTemporaryFile(delete=False) as tmpfile:
                audio_config = AudioConfig(filename=tmpfile.name)
                synthesizer = SpeechSynthesizer(
                    speech_config=self.speech_config, 
                    audio_config=audio_config
                )
                result = synthesizer.speak_text_async(text).get()
                
                if result.reason == ResultReason.SynthesizingAudioCompleted:
                    with open(tmpfile.name, 'rb') as audio_file:
                        return audio_file.read()
        except Exception as e:
            print(f"TTS Error: {str(e)}")
        return None

    def speech_to_text(self, audio_data: bytes) -> Optional[str]:
        try:
            with tempfile.NamedTemporaryFile(delete=False) as tmpfile:
                tmpfile.write(audio_data)
                tmpfile.flush()
                
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
    # ... (keep existing implementation but add difficulty handling)
    def generate_question(self, context: str, previous_answers: list, difficulty: str) -> Dict[str, Any]:
        prompt = f"""
        Generate a {difficulty} difficulty interview question based on:
        Job Description: {context}
        
        Previous Q&A:
        {json.dumps(previous_answers, indent=2)}
        
        Requirements:
        - Relevant to job description
        - Difficulty level: {difficulty}
        - Open-ended for detailed responses
        - Professional formatting
        
        Return JSON format with 'text' and 'difficulty' fields.
        """
        
        payload = {
            "model": "llama3-70b-8192",
            "messages": [
                {"role": "system", "content": "You are a professional interview coach generating technical questions."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 200
        }
        
        try:
            response = requests.post(self.api_url, headers=self.headers, json=payload)
            response.raise_for_status()
            return json.loads(response.json()["choices"][0]["message"]["content"])
        except Exception as e:
            return {"text": f"Question generation failed: {str(e)}", "difficulty": difficulty}
        