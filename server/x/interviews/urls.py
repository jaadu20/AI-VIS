from django.urls import path
from . import views

urlpatterns = [
    path('generate-question/', views.generate_question, name='generate_question'),
    path('submit-answer/', views.submit_answer, name='submit_answer'),
    path('<int:interview_id>/results/', views.interview_results, name='interview_results'),
]
