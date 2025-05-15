# interviews/urls.py
from django.urls import path
from .views import (
    InterviewStartView, InterviewSubmitAnswerView, InterviewResultView,
    TextToSpeechView, SpeechToTextView, InterviewListView, QuestionListView
)

urlpatterns = [
    path('interviews/start/', InterviewStartView.as_view(), name='interview-start'),
    path('interviews/<str:interview_id>/submit/', InterviewSubmitAnswerView.as_view(), name='submit-answer'),
    path('interviews/tts/', TextToSpeechView.as_view(), name='text-to-speech'),
    path('interviews/stt/', SpeechToTextView.as_view(), name='speech-to-text'),
    path('interviews/<str:interview_id>/result/', InterviewResultView.as_view(), name='interview-result'),
    path('interviews/', InterviewListView.as_view(), name='interview-list'),
    path('questions/', QuestionListView.as_view(), name='question-list'),
]