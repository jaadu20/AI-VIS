# applications/urls.py
from django.urls import path
from .views import (
    AllApplicationsView,
    ApplicationCreateView,
    ApplicationListView,
    ApplicationDetailView,
    ApplicationUpdateView,
    ApplicationDeleteView,
    CheckEligibilityView,
    ScheduleInterviewView,
    UserApplicationsView,
)

app_name = 'applications'

urlpatterns = [
    path('create/', ApplicationCreateView.as_view(), name='create_application'),
    path('', ApplicationListView.as_view(), name='application_list'),
    path('user/', UserApplicationsView.as_view(), name='user_applications'),
    path('<uuid:pk>/', ApplicationDetailView.as_view(), name='application_detail'),
    path('<uuid:pk>/update/', ApplicationUpdateView.as_view(), name='application_update'),
    path('<uuid:pk>/delete/', ApplicationDeleteView.as_view(), name='application_delete'),
    path('check-eligibility/', CheckEligibilityView.as_view(), name='check_eligibility'),
    path('schedule-interview/', ScheduleInterviewView.as_view(), name='schedule_interview'),
    path('all/', AllApplicationsView.as_view(), name='all_applications'),

]