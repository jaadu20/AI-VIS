from django.urls import path
from .views import GenerateQuestionView, SubmitAnswerView, TextToSpeechView, SpeechToTextView

urlpatterns = [
    path('generate-question/', GenerateQuestionView.as_view(), name='generate-question'),
    path('submit-answer/', SubmitAnswerView.as_view(), name='submit-answer'),
    path('azure/tts/', TextToSpeechView.as_view(), name='text-to-speech'),
    path('azure/stt/', SpeechToTextView.as_view(), name='speech-to-text'),
]