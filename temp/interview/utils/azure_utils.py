import os
from azure.cognitiveservices.speech import (
    SpeechConfig, SpeechSynthesizer, AudioConfig,
    SpeechRecognizer, AudioDataStream
)

class AzureService:
    def __init__(self):
        self.speech_key = os.getenv("AZURE_SPEECH_KEY")
        self.service_region = os.getenv("AZURE_SERVICE_REGION")
        
    def text_to_speech(self, text):
        speech_config = SpeechConfig(
            subscription=self.speech_key, 
            region=self.service_region
        )
        audio_config = AudioConfig(use_default_speaker=True)
        synthesizer = SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)
        result = synthesizer.speak_text_async(text).get()
        return AudioDataStream(result).save_to_wav_file("temp.wav")

    def speech_to_text(self, audio_file):
        speech_config = SpeechConfig(
            subscription=self.speech_key,
            region=self.service_region
        )
        audio_config = AudioConfig(filename=audio_file)
        recognizer = SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
        result = recognizer.recognize_once_async().get()
        return result.text
    
# import os
# from azure.cognitiveservices.speech import (
#     SpeechConfig, SpeechSynthesizer, SpeechRecognizer, AudioConfig
# )
# from django.core.files.base import ContentFile

# class AzureServices:
#     def __init__(self):
#         self.speech_config = SpeechConfig(
#             subscription=os.getenv("AZURE_SPEECH_KEY"),
#             region=os.getenv("AZURE_SERVICE_REGION")
#         )

#     def text_to_speech(self, text):
#         synthesizer = SpeechSynthesizer(speech_config=self.speech_config)
#         result = synthesizer.speak_text_async(text).get()
#         return ContentFile(result.audio_data, name="question.mp3")

#     def speech_to_text(self, audio_file):
#         audio_config = AudioConfig(filename=audio_file.temporary_file_path())
#         recognizer = SpeechRecognizer(
#             speech_config=self.speech_config,
#             audio_config=audio_config
#         )
#         result = recognizer.recognize_once_async().get()
#         return result.text