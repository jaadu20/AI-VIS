from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.CompanyDashboardView.as_view(), name='company_dashboard'),
    path('post-job/', views.PostJobView.as_view(), name='post_job'),
    path('edit-job/<int:pk>/', views.EditJobView.as_view(), name='edit_job'),
]