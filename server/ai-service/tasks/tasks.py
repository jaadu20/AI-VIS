from celery import Celery
from .voice_analysis import analyze_voice
from .facial_analysis import analyze_facial

celery = Celery(
    'tasks',
    broker='redis://redis:6379/0',
    backend='redis://redis:6379/0'
)

@celery.task
def process_voice(audio_path):
    return analyze_voice(audio_path)

@celery.task
def process_facial(video_path):
    return analyze_facial(video_path)