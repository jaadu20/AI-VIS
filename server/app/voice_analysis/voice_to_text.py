import os
import azure.cognitiveservices.speech as speechsdk

def recognize_speech_with_azure():
    # Set up Azure Speech configuration
    speech_key = "1JJ3FlHJyQWky4QtvopDo2MF94FXoXYryKTSglxwNg1DfAZRuJ48JQQJ99BCACYeBjFXJ3w3AAAYACOGJfEf"
    service_region = "eastus"

    # Create a SpeechConfig object
    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)

    # Create an audio config (use default microphone)
    audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)

    # Create a SpeechRecognizer object
    recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

    print("Please speak something...")
    
    # Recognize speech
    result = recognizer.recognize_once()

    # Check the result
    if result.reason == speechsdk.ResultReason.RecognizedSpeech:
        recognized_text = result.text
        print(f"Recognized Text: {recognized_text}")
        return recognized_text
    elif result.reason == speechsdk.ResultReason.NoMatch:
        print("No speech could be recognized.")
    elif result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = result.cancellation_details
        print(f"Speech recognition canceled: {cancellation_details.reason}")
        if cancellation_details.reason == speechsdk.CancellationReason.Error:
            print(f"Error details: {cancellation_details.error_details}")
    return None

if __name__ == "__main__":
    # Convert speech to text using Azure
    recognized_text = recognize_speech_with_azure()