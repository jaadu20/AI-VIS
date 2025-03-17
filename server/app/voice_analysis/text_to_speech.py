from gtts import gTTS
from playsound import playsound
import os

def text_to_speech(text, language='en', output_file='output.mp3'):
    # Create a gTTS object
    tts = gTTS(text=text, lang=language, slow=False)
    
    # Save the converted audio to a file
    tts.save(output_file)
    
    # Play the converted file using playsound
    playsound(output_file)
    
    # Optionally, delete the file after playing
    os.remove(output_file)

if __name__ == "__main__":
    # Take text input from the user
    text = input("Enter the text you want to convert to speech: ")
    
    # Convert the text to speech
    text_to_speech(text)
