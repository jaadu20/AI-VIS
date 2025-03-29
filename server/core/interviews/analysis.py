# analysis_services.py
from deepface import DeepFace
import librosa
import numpy as np

def analyze_facial_expression(video_path):
    analysis = DeepFace.analyze(
        img_path=video_path,
        actions=['emotion', 'age'],
        detector_backend='opencv'
    )
    confidence_score = analysis[0]['face_confidence']
    emotion_impact = {
        'happy': 1.2,
        'neutral': 1.0,
        'sad': 0.8,
        'angry': 0.7
    }.get(analysis[0]['dominant_emotion'], 1.0)
    
    return confidence_score * emotion_impact * 10

def analyze_voice_tone(audio_path):
    y, sr = librosa.load(audio_path)
    
    # Extract audio features
    pitch = librosa.yin(y, fmin=50, fmax=2000)
    tempo = librosa.beat.tempo(y=y, sr=sr)[0]
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    
    # Calculate voice confidence score
    score = np.mean(spectral_centroid) * (tempo/200) * (np.std(pitch)/100)
    return min(max(score * 10, 0), 10)  # Normalize to 0-10