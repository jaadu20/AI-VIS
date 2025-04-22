# job application urls.py

from django.urls import path
from .views import JobDetailView, ApplicationCreateView, EligibilityCheckView

urlpatterns = [
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('applications/', ApplicationCreateView.as_view(), name='application-create'),
    path('applications/check-eligibility/', EligibilityCheckView.as_view(), name='check-eligibility'),
]