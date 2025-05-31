# interviews/models.py
import uuid
import os
from django.db import models
from django.contrib.auth import get_user_model
from interview_applications.models import Application

User = get_user_model()

def interview_video_path(instance, filename):
    return f'interviews/videos/{instance.id}/{filename}'

def interview_audio_path(instance, filename):
    return f'interviews/audio/{instance.id}/{filename}'

def interview_media_path(instance, filename):
     return f'interviews/{instance.id}/{filename}'

class Interview(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(
            Application,  # Use the actual model class
            on_delete=models.CASCADE,
            related_name='interviews',
            default=None
        )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interviews')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    total_score = models.FloatField(default=0)
    feedback = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Interview for {self.application.job_title} at {self.application.company_name}"

class Question(models.Model):
    DIFFICULTY_CHOICES = (
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    )
    
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    order = models.PositiveIntegerField()
    is_predefined = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Q{self.order}: {self.text[:50]}..."

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    text = models.TextField(blank=True, null=True)
    audio = models.FileField(upload_to=interview_audio_path, blank=True, null=True)
    video_frame = models.ImageField(upload_to=interview_video_path, blank=True, null=True)
    score = models.FloatField(blank=True, null=True)
    audio_score = models.FloatField(blank=True, null=True)
    video_score = models.FloatField(blank=True, null=True)
    feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer to Q{self.question.order} - Score: {self.score}"