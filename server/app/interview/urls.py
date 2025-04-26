# interviews/urls.py
from django.urls import path
from .views import (
    StartInterviewView,
    SubmitAnswerView,
    AzureTTSView,
    AzureSTTView
)

urlpatterns = [
    path('start/', StartInterviewView.as_view(), name='start-interview'),
    path('<uuid:interview_id>/submit/', SubmitAnswerView.as_view(), name='submit-answer'),
    path('azure/tts/', AzureTTSView.as_view(), name='azure-tts'),
    path('azure/stt/', AzureSTTView.as_view(), name='azure-stt'),
]