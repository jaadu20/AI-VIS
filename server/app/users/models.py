from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(
        max_length=20,
        choices=(('candidate', 'Candidate'), ('company', 'Company'))
    )
    phone = models.CharField(max_length=20)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'role', 'phone']
    objects = UserManager()

    def __str__(self):
        return self.email

class CompanyProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company_profile')
    company_name = models.CharField(max_length=255)
    company_address = models.TextField()

# class CandidateProfile(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='candidate_profile')
#     # resume = models.FileField(upload_to='resumes/', null=True, blank=True)
class CandidateProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='candidate_profile')
    education = models.JSONField(default=list)
    skills = models.TextField(blank=True)
    experience = models.TextField(blank=True)
    cv = models.FileField(upload_to='cvs/', null=True, blank=True)
    about_me = models.TextField(blank=True)
    image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
#----------------------------------------------------------------------------------
class PasswordReset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="password_resets")
    code = models.CharField(max_length=6) 
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(hours=1)

    def __str__(self):
        return f"PasswordReset for {self.user.email} at {self.created_at}"
