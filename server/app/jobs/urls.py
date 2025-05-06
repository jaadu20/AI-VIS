# jobs/urls.py
from django.urls import path
from .views import JobCreateView, CompanyJobListView, JobListView, JobUpdateView, JobDeleteView, JobDetailView,JobsByCompanyView


urlpatterns = [
    path('', JobCreateView.as_view(), name='job-create'),
    path('company/', CompanyJobListView.as_view(), name='company-jobs'),
    path('all/', JobListView.as_view(), name='all-jobs'),
    path('update/<int:pk>/', JobUpdateView.as_view(), name='job-update'),
    path('<int:pk>/delete/', JobDeleteView.as_view(), name='job-delete'),
    path('current/<int:pk>/', JobDetailView.as_view(), name='job-detail'), 
    path('company/<int:company_id>/', JobsByCompanyView.as_view(), name='jobs-by-company'),

]