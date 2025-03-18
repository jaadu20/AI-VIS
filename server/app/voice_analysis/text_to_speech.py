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
    text = "That separates Facebook ad campaigns that lose money from ones that make $10,000 plus per month. " \
    "Not what most e-commerce gurus tell you. I'm gonna reveal this critical difference in just a few minutes. " \
    "I'm the CEO of one of the largest e-commerce education platforms in the country. I ran hundreds of ad" \
    " campaigns that have brought me in a consistent 4 to five times my return on Aspen. There's a pattern " \
    "I've discovered the most successful ones all have a hidden structure at 93% of beginners." #input("Enter text")
    
    # Convert the text to speech
    text_to_speech(text)
