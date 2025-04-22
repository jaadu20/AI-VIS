from django.urls import path
from interview.views import (
    InterviewAPI,
    QuestionGenerationAPI,
    AnswerProcessingAPI,
    TTSServiceAPI,
    STTServiceAPI
)

urlpatterns = [
    path('api/interview/start/', InterviewAPI.as_view()),
    path('api/interview/generate-question/', QuestionGenerationAPI.as_view()),
    path('api/interview/submit-answer/', AnswerProcessingAPI.as_view()),
    path('api/azure/tts/', TTSServiceAPI.as_view()),
    path('api/azure/stt/', STTServiceAPI.as_view()),
]

# from django.urls import path
# from interview.views import (
#     InterviewAPI,
#     QuestionGenerationAPI,
#     AnswerProcessingAPI,
#     SpeechServiceAPI
# )

# urlpatterns = [
#     path('api/interview/start/', InterviewAPI.as_view()),
#     path('api/interview/generate-question/', QuestionGenerationAPI.as_view()),
#     path('api/interview/submit-answer/', AnswerProcessingAPI.as_view()),
#     path('api/azure/speech/', SpeechServiceAPI.as_view()),
# ]