import azure.cognitiveservices.speech as speechsdk
import os
from django.conf import settings
from io import BytesIO

class AzureSpeechService:
    def __init__(self):
        self.speech_config = speechsdk.SpeechConfig(
            subscription=settings.AZURE_SPEECH_KEY,
            region=settings.AZURE_SPEECH_REGION
        )
        self.speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
        
    def text_to_speech(self, text):
        """Convert text to speech and return audio bytes"""
        synthesizer = speechsdk.SpeechSynthesizer(speech_config=self.speech_config, audio_config=None)
        result = synthesizer.speak_text_async(text).get()
        
        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            return BytesIO(result.audio_data)
        else:
            raise Exception(f"Speech synthesis failed: {result.reason}")
    
    def speech_to_text(self, audio_stream):
        """Convert speech audio to text"""
        audio_config = speechsdk.audio.AudioConfig(stream=audio_stream)
        recognizer = speechsdk.SpeechRecognizer(speech_config=self.speech_config, audio_config=audio_config)
        
        result = recognizer.recognize_once_async().get()
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            return result.text
        else:
            raise Exception(f"Speech recognition failed: {result.reason}")