# # applications/urls.py
# from django.urls import path
# from .views import (
#     ApplicationCreateView,
#     ApplicationListView,
#     ApplicationDetailView,
#     JobApplicationsView,
#     CandidateApplicationsView,
#     InterviewDetailView,
#     SubmitInterviewAnswerView,
#     CompleteInterviewView
# )

# urlpatterns = [
#     path('', ApplicationCreateView.as_view(), name='application-create'),
#     path('list/', ApplicationListView.as_view(), name='application-list'),
#     path('<uuid:id>/', ApplicationDetailView.as_view(), name='application-detail'),
#     path('job/<int:job_id>/', JobApplicationsView.as_view(), name='job-applications'),
#     path('candidate/', CandidateApplicationsView.as_view(), name='candidate-applications'),
#     path('interview/<uuid:application_id>/', InterviewDetailView.as_view(), name='interview-detail'),
#     path('interview/question/<int:question_id>/answer/', SubmitInterviewAnswerView.as_view(), name='submit-answer'),
#     path('interview/<int:interview_id>/complete/', CompleteInterviewView.as_view(), name='complete-interview'),
# ]
