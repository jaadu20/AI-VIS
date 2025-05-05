# job application urls.py
from django.urls import path
from .views import ApplicationCreateView, EligibilityCheckView

urlpatterns = [
    path('applications/', ApplicationCreateView.as_view(), name='application-create'),
    path('applications/check-eligibility/', EligibilityCheckView.as_view(), name='check-eligibility'),
]