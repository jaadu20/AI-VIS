# jobs/urls.py
from django.urls import path
from .views import JobCreateView, CompanyJobListView, JobListView


urlpatterns = [
    path('', JobCreateView.as_view(), name='job-create'),
    path('company/', CompanyJobListView.as_view(), name='company-jobs'),
    path('all/', JobListView.as_view(), name='all-jobs'),
]