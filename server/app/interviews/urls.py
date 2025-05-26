# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('interviews/start/', views.start_interview, name='start_interview'),
    path('interviews/<uuid:interview_id>/submit/', views.submit_answer, name='submit_answer'),
    path('interviews/tts/', views.text_to_speech, name='text_to_speech'),
    path('interviews/stt/', views.speech_to_text, name='speech_to_text'),
    path('interviews/<uuid:interview_id>/result/', views.get_interview_result, name='get_interview_result'),
]
