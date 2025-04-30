# interviews/urls.py
from django.urls import path
from .views import (
    StartInterviewView,
    SubmitAnswerView,
    TextToSpeechView,
    SpeechToTextView
)

urlpatterns = [
    path('start/', StartInterviewView.as_view(), name='start-interview'),
    path('<uuid:interview_id>/submit/', SubmitAnswerView.as_view(), name='submit-answer'),
    path('tts/', TextToSpeechView.as_view(), name='text-to-speech'),
    path('stt/', SpeechToTextView.as_view(), name='speech-to-text'),
]