from django.db import models
from users.models import User

class CandidateProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='candidate_profile')
    education = models.JSONField(default=list)
    skills = models.TextField(blank=True)
    experience = models.TextField(blank=True)
    cv = models.FileField(upload_to='cvs/', null=True, blank=True)
    cover_letter = models.FileField(upload_to='cover_letters/', null=True, blank=True)
    about_me = models.TextField(blank=True)
    education_level = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='profile_images/', null=True, blank=True)