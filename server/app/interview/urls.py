# interviews/urls.py
from django.urls import path
from .views import (
    StartInterviewView,
    SubmitAnswerView,
    InterviewResultView,
    AzureTTSView,
    AzureSTTView
)

urlpatterns = [
    path('start/', StartInterviewView.as_view(), name='start-interview'),
    path('<uuid:interview_id>/submit/', SubmitAnswerView.as_view(), name='submit-answer'),
    path('<uuid:interview_id>/result/', InterviewResultView.as_view(), name='interview-result'),
    path('tts/', AzureTTSView.as_view(), name='azure-tts'),
    path('stt/', AzureSTTView.as_view(), name='azure-stt'),
]