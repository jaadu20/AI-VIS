import os
import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class AzureSpeechService:
    def __init__(self):
        # Get Azure credentials from environment variables
        self.speech_key = os.getenv("AZURE_SPEECH_KEY")
        self.service_region = os.getenv("AZURE_SERVICE_REGION")
        
        if not self.speech_key or not self.service_region:
            raise ValueError("Azure Speech credentials not found in environment variables")
            
        # Configure speech components
        self.speech_config = speechsdk.SpeechConfig(
            subscription=self.speech_key,
            region=self.service_region
        )
        self.audio_config = speechsdk.audio.AudioConfig(
            use_default_microphone=True
        )
        
    def recognize_speech(self, prompt=None):
        try:
            recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=self.audio_config
            )
            
            if prompt:
                print(prompt)
                
            result = recognizer.recognize_once()
            
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                return result.text.strip()
            elif result.reason == speechsdk.ResultReason.NoMatch:
                raise Exception("No speech could be recognized")
            elif result.reason == speechsdk.ResultReason.Canceled:
                cancellation = result.cancellation_details
                raise Exception(f"Recognition canceled: {cancellation.reason}. Details: {cancellation.error_details}")
                
        except Exception as e:
            print(f"Speech recognition error: {str(e)}")
            return None

    def text_to_speech(self, text):
        """Convert text to speech using Azure Cognitive Services"""
        try:
            self.speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=self.speech_config
            )
            
            result = synthesizer.speak_text_async(text).get()
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                return True
            else:
                raise Exception(f"Speech synthesis failed: {result.reason}")
                
        except Exception as e:
            print(f"Speech synthesis error: {str(e)}")
            return False

if __name__ == "__main__":
    try:
        speech_service = AzureSpeechService()
        
        # Test speech synthesis
        speech_service.text_to_speech("Welcome to the Azure Speech Service Demo")
        
        # Test speech recognition
        user_input = speech_service.recognize_speech("Please speak your answer now...")
        if user_input:
            print(f"You said: {user_input}")
            
    except Exception as e:
        print(f"Error initializing speech service: {str(e)}")