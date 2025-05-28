from django.urls import path
from .views import StartInterviewView, NextQuestionView, SubmitAnswerView

urlpatterns = [
    path('start/<uuid:application_id>/', StartInterviewView.as_view(), name='start-interview'),
    path('<uuid:interview_id>/next-question/', NextQuestionView.as_view(), name='next-question'),
    path('<uuid:interview_id>/answer/<uuid:question_id>/', SubmitAnswerView.as_view(), name='submit-answer'),
]