from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_candidate = models.BooleanField(default=False)
    is_company = models.BooleanField(default=False)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)  # For candidates
    company_name = models.CharField(max_length=100, blank=True)  # For companies