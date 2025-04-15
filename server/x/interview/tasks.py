from celery import shared_task
from .models import Answer
from .services.azure_client import AzureSpeechService

@shared_task
def process_audio_response(answer_id):
    answer = Answer.objects.get(id=answer_id)
    azure_service = AzureSpeechService()
    
    with open(answer.audio_response.path, 'rb') as audio_file:
        text = azure_service.speech_to_text(audio_file)
    
    answer.text_response = text
    answer.save()
