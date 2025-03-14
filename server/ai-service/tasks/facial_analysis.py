import cv2
from deepface import DeepFace
import numpy as np

def analyze_facial(video_path):
    """
    Analyzes facial emotions from a video file.
    Args:
        video_path (str): Path to the video file.
    Returns:
        dict: A dictionary containing emotion percentages.
    """
    # Open the video file
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Could not open video file.")

    emotion_results = []
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break  # End of video

        # Analyze the frame for facial emotions
        try:
            analysis = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
            if analysis and isinstance(analysis, list):
                emotions = analysis[0]['emotion']
                emotion_results.append(emotions)
        except Exception as e:
            print(f"Error analyzing frame: {e}")

        frame_count += 1

    # Release the video capture object
    cap.release()

    if not emotion_results:
        return {"error": "No faces detected in the video."}

    # Calculate average emotion percentages
    avg_emotions = {
        "angry": 0,
        "disgust": 0,
        "fear": 0,
        "happy": 0,
        "sad": 0,
        "surprise": 0,
        "neutral": 0,
    }

    for result in emotion_results:
        for emotion, value in result.items():
            avg_emotions[emotion] += value

    for emotion in avg_emotions:
        avg_emotions[emotion] /= len(emotion_results)

    return avg_emotions