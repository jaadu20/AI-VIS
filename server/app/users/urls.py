# users/urls.py
from django.urls import path
from .views import (
    SignupView,
    MyTokenObtainPairView,
    ForgotPasswordView,
    ResetPasswordView, 
    CandidateProfileView,
    LogoutView, 
)

urlpatterns = [
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/login/', MyTokenObtainPairView.as_view(), name='login'),
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),  # New
    path('candidate/profile/', CandidateProfileView.as_view(), name='candidate-profile'),
]
    