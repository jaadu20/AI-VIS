# jobs/urls.py
from django.urls import path
from .views import JobCreateView, CompanyJobListView, JobListView, JobUpdateView, JobDeleteView


urlpatterns = [
    path('', JobCreateView.as_view(), name='job-create'),
    path('company/', CompanyJobListView.as_view(), name='company-jobs'),
    path('all/', JobListView.as_view(), name='all-jobs'),
    path('<int:pk>/', JobUpdateView.as_view(), name='job-update'),
    path('<int:pk>/delete/', JobDeleteView.as_view(), name='job-delete'),

]