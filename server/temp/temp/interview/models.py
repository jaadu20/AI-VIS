from django.db import models
from django.contrib.auth import get_user_model
from jobs.models import JobPosting

User = get_user_model()
from django.db import models

class Interview(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed')
    ]
    
    candidate = models.ForeignKey(User, on_delete=models.CASCADE)
    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    overall_score = models.FloatField(null=True)

class Question(models.Model):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE)
    text = models.TextField()
    order = models.PositiveIntegerField()
    difficulty = models.CharField(max_length=10, 
        choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')])
    generated = models.BooleanField(default=False)

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    text = models.TextField()
    audio_path = models.CharField(max_length=255)
    video_path = models.CharField(max_length=255)
    content_score = models.FloatField()
    voice_score = models.FloatField()
    facial_score = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)