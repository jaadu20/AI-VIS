# jobs/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_job_postings, name='list_job_postings'),
    path('create/', views.create_job_posting, name='create_job_posting'),
]
