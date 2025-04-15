import azure.cognitiveservices.speech as speechsdk
import os 

def speech_to_text(audio_file_path: str) -> str:
    """
    Convert speech to text using Microsoft Azure Speech-to-Text.
    `audio_file_path` is the local path to the audio file.
    """
    speech_key = os.environ.get("AZURE_SPEECH_KEY")
    region = os.environ.get("AZURE_SERVICE_REGION")
    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=region)
    audio_input = speechsdk.AudioConfig(filename=audio_file_path)
    speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_input)
    result = speech_recognizer.recognize_once()
    if result.reason == speechsdk.ResultReason.RecognizedSpeech:
        return result.text
    else:
        return ""

def text_to_speech(text: str, output_audio_path: str):
    """
    Convert text to speech using Microsoft Azure Text-to-Speech.
    The output audio is saved to output_audio_path.
    """
    speech_key = os.environ.get("AZURE_SPEECH_KEY")
    region = os.environ.get("AZURE_SERVICE_REGION")
    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=region)
    audio_config = speechsdk.audio.AudioOutputConfig(filename=output_audio_path)
    synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)
    synthesizer.speak_text_async(text).get()
