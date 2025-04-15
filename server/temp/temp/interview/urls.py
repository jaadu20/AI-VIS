from django.urls import path
from . import views

urlpatterns = [
    path("api/interview/generate-question", views.generate_question_view, name="generate_question"),
    path("api/interview/submit-answer", views.submit_answer_view, name="submit_answer"),
    path("api/interviews/<int:interview_id>/results", views.interview_results_view, name="interview_results"),
]
