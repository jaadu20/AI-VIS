# interview/api/urls.py
from django.urls import path
from .views import InterviewViewSet, VoiceConversionView, QuestionGenerationView

interview_view = InterviewViewSet.as_view({
    'post': 'start_interview'
})

voice_conversion_view = VoiceConversionView.as_view({
    'post': 'convert_voice'
})

question_generation_view = QuestionGenerationView.as_view({
    'post': 'generate_question'
})

urlpatterns = [
    path('interviews/start_interview/', interview_view, name='start_interview'),
    path('convert-voice/', voice_conversion_view, name='convert_voice'),
    path('generate-question/', question_generation_view, name='generate_question'),
    path('interviews/submit-answer/', InterviewViewSet.as_view({'post': 'submit_answer'}), name='submit_answer'),
    path('interviews/<int:pk>/questions/', InterviewViewSet.as_view({'get': 'list_questions'}), name='list_questions'),
]
