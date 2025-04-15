import os
import azure.cognitiveservices.speech as speechsdk
import uuid
from django.core.files.storage import default_storage
from django.conf import settings

class AzureSpeechService:
    def __init__(self):
        self.speech_key = os.getenv('AZURE_SPEECH_KEY')
        self.service_region = os.getenv('AZURE_SERVICE_REGION')

    def text_to_speech(self, text):
        speech_config = speechsdk.SpeechConfig(
            subscription=self.speech_key, 
            region=self.service_region
        )
        synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)
        result = synthesizer.speak_text_async(text).get()
        audio_data = result.audio_data
        filename = f"questions/audio/{uuid.uuid4()}.wav"
        file_path = default_storage.save(filename, audio_data)
        return default_storage.url(file_path)
    
    def speech_to_text(self, audio_stream):
        audio_config = speechsdk.audio.AudioConfig(stream=audio_stream)
        speech_recognizer = speechsdk.SpeechRecognizer(
            speech_config=speechsdk.SpeechConfig(
                subscription=self.speech_key,
                region=self.service_region
            ),
            audio_config=audio_config
        )
        result = speech_recognizer.recognize_once()
        return result.text
