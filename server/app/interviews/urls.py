# interviews/urls.py
from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'interviews', views.InterviewViewSet, basename='interview')

urlpatterns = [
    path('start/', views.InterviewViewSet.as_view({'post': 'start'}), name='interview-start'),
    path('tts/', views.TextToSpeechView.as_view(), name='text_to_speech'),
    path('stt/', views.SpeechToTextView.as_view(), name='speech_to_text'),
    path('submit-answer/', views.SubmitAnswerView.as_view(), name='submit_answer'),
    path('result/<uuid:interview_id>/', views.InterviewResultView.as_view(), name='interview_result'),
] + router.urls