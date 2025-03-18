from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    username = None  # Explicitly remove username
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(
        max_length=20,
        choices=(('candidate', 'Candidate'), ('company', 'Company'))
    )
    phone = models.CharField(max_length=20)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'role', 'phone']

class CompanyProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company_profile')
    company_name = models.CharField(max_length=255)
    company_address = models.TextField()

class CandidateProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='candidate_profile')
    # resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    

class PasswordReset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="password_resets")
    code = models.CharField(max_length=6)  # Six-digit reset code
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        # Reset code valid for 1 hour
        return timezone.now() > self.created_at + timedelta(hours=1)

    def __str__(self):
        return f"PasswordReset for {self.user.email} at {self.created_at}"
