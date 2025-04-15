import azure.cognitiveservices.speech as speechsdk
import os

class SpeechService:
    def __init__(self):
        self.speech_config = speechsdk.SpeechConfig(
            subscription=os.getenv("AZURE_SPEECH_KEY"),
            region=os.getenv("AZURE_SPEECH_REGION")
        )
        
    def text_to_speech(self, text: str) -> bytes:
        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=self.speech_config, 
            audio_config=None
        )
        result = synthesizer.speak_text_async(text).get()
        return result.audio_data
    
    def speech_to_text(self, audio_data: bytes) -> str:
        audio_stream = speechsdk.AudioInputStream(audio_data)
        recognizer = speechsdk.SpeechRecognizer(
            speech_config=self.speech_config, 
            audio_config=speechsdk.audio.AudioConfig(stream=audio_stream)
        )
        result = recognizer.recognize_once()
        return result.text