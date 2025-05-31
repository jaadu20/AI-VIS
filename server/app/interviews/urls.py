from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    InterviewViewSet,
    TextToSpeechView,
    SpeechToTextView,
    SubmitAnswerView,
    InterviewResultView
)

router = DefaultRouter()
router.register(r'', InterviewViewSet, basename='interview')  # Changed from 'interviews' to ''

urlpatterns = [
    path('start/', InterviewViewSet.as_view({'post': 'start'}), name='interview-start'),
    path('tts/', TextToSpeechView.as_view(), name='text_to_speech'),
    path('stt/', SpeechToTextView.as_view(), name='speech_to_text'),
    path('submit-answer/', SubmitAnswerView.as_view(), name='submit_answer'),
    path('result/<uuid:interview_id>/', InterviewResultView.as_view(), name='interview_result'),
] + router.urls