from google.cloud import speech_v1p1beta1 as speech

def analyze_voice(audio_path):
    client = speech.SpeechClient()
    with open(audio_path, "rb") as audio_file:
        content = audio_file.read()
    
    audio = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
        sample_rate_hertz=48000,
        language_code="en-US",
    )
    
    response = client.recognize(config=config, audio=audio)
    return response.results[0].alternatives[0].transcript