# ai_services/facial_analysis.py
from deepface import DeepFace

def analyze_expression(frame):
    results = DeepFace.analyze(
        img_path=frame,
        actions=['emotion', 'age'],
        enforce_detection=False
    )
    return {
        'emotion': results[0]['dominant_emotion'],
        'confidence': results[0]['emotion'][results[0]['dominant_emotion']]
    }