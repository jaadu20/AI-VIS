import azure.cognitiveservices.speech as speechsdk
import os
# Configuration
API_KEY = 'CJWsbzwSAOkCVJbDh1qcMHmMAb9lZP2Y9iQkqjIf26WtMt7GHYsOJQQJ99BDACYeBjFXJ3w3AAAYACOGumQH'
REGION = 'eastus'

# Create a speech config
speech_config = speechsdk.SpeechConfig(subscription=API_KEY, region=REGION)

# Optional: Choose your voice
speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"

# Text to Speech (TTS)
def text_to_speech(text):
    synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)
    result = synthesizer.speak_text_async(text).get()

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        print("Speech synthesized to speaker.")
    elif result.reason == speechsdk.ResultReason.Canceled:
        cancellation = result.cancellation_details
        print("Speech synthesis canceled:", cancellation.reason)
        if cancellation.reason == speechsdk.CancellationReason.Error:
            print("Error details:", cancellation.error_details)

# Speech to Text (STT)
def speech_to_text():
    recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config)

    print("Speak into your microphone...")
    result = recognizer.recognize_once_async().get()

    if result.reason == speechsdk.ResultReason.RecognizedSpeech:
        print("Recognized:", result.text)
        return result.text
    elif result.reason == speechsdk.ResultReason.NoMatch:
        print("No speech could be recognized.")
    elif result.reason == speechsdk.ResultReason.Canceled:
        cancellation = result.cancellation_details
        print("Speech recognition canceled:", cancellation.reason)
        if cancellation.reason == speechsdk.CancellationReason.Error:
            print("Error details:", cancellation.error_details)

# Example usage
if __name__ == "__main__":
    # TTS
    text_to_speech("Hello! This is Azure Text to Speech in action.")

    # STT
    recognized_text = speech_to_text()
