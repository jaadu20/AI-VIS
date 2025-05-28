# services/speech_service.py
import azure.cognitiveservices.speech as speechsdk
from django.conf import settings
from django.http import HttpResponse
import io

class SpeechService:
    def __init__(self):
        self.speech_key = settings.AZURE_SPEECH_KEY
        self.service_region = settings.AZURE_SPEECH_REGION
        
    def text_to_speech(self, text: str) -> bytes:
        """Convert text to speech using Azure Speech Service"""
        speech_config = speechsdk.SpeechConfig(
            subscription=self.speech_key, 
            region=self.service_region
        )
        
        # Configure voice settings
        speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
        speech_config.set_speech_synthesis_output_format(
            speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
        )
        
        # Create synthesizer with in-memory stream
        audio_stream = speechsdk.AudioOutputStream()
        audio_config = speechsdk.audio.AudioOutputConfig(stream=audio_stream)
        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=speech_config, 
            audio_config=audio_config
        )
        
        # Synthesize speech
        result = synthesizer.speak_text_async(text).get()
        
        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            # Get audio data
            audio_data = bytes(result.audio_data)
            return audio_data
        else:
            raise Exception(f"Speech synthesis failed: {result.reason}")
    
    def speech_to_text(self, audio_file) -> str:
        """Convert speech to text using Azure Speech Service"""
        speech_config = speechsdk.SpeechConfig(
            subscription=self.speech_key,
            region=self.service_region
        )
        speech_config.speech_recognition_language = "en-US"
        
        # Create audio config from uploaded file
        audio_stream = speechsdk.AudioInputStream.create_pull_stream(
            speechsdk.audio.PullAudioInputStreamCallback(audio_file)
        )
        audio_config = speechsdk.audio.AudioConfig(stream=audio_stream)
        
        # Create recognizer
        speech_recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config,
            audio_config=audio_config
        )
        
        # Perform recognition
        result = speech_recognizer.recognize_once()
        
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            return result.text
        elif result.reason == speechsdk.ResultReason.NoMatch:
            return "Could not understand audio"
        else:
            raise Exception(f"Speech recognition failed: {result.reason}")