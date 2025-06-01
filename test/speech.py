import speech_recognition as sr
from gtts import gTTS
from playsound import playsound
import os

def listen(max_duration=30):
    """Capture up to `max_duration` seconds of speech."""
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print(f"\n🎤 Listening... You have up to {max_duration} seconds. Say 'stop' to exit.")
        recognizer.adjust_for_ambient_noise(source)
        try:
            audio = recognizer.listen(source, timeout=1, phrase_time_limit=max_duration)
        except sr.WaitTimeoutError:
            print("⏱️ Timeout: No speech detected.")
            return ""
    try:
        text = recognizer.recognize_google(audio)
        print("🗣️ You said:", text)
        return text.lower()
    except sr.UnknownValueError:
        print("🤷 Could not understand audio.")
        return ""
    except sr.RequestError as e:
        print(f"🚫 Google STT error: {e}")
        return ""

def speak(text):
    """Convert text to speech and play it."""
    try:
        tts = gTTS(text=text, lang='en')
        filename = "response.mp3"
        tts.save(filename)
        playsound(filename)
    finally:
        if os.path.exists(filename):
            os.remove(filename)

def chat_loop():
    """Main loop with up to 30-second audio capture."""
    speak("Hi, you can now speak for up to 30 seconds. Say 'stop' to end.")
    while True:
        user_input = listen(max_duration=30)
        if not user_input:
            continue
        if "stop" in user_input or "exit" in user_input:
            speak("Goodbye!")
            break

if __name__ == "__main__":
    chat_loop()
