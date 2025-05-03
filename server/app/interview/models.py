# interviews/models.py
import uuid
from django.db import models
from job_applications.models import Application

class Interview(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    application = models.ForeignKey(
        Application,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    interview_id = models.UUIDField(default=uuid.uuid4, unique=True)
    current_question = models.PositiveIntegerField(default=0)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    total_score = models.FloatField(default=0)

    class Meta:
        ordering = ['-created_at']

class Question(models.Model):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    order = models.PositiveIntegerField()
    is_predefined = models.BooleanField(default=False)
    difficulty = models.CharField(max_length=10, choices=Interview.DIFFICULTY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    answer_score = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['order']

class Answer(models.Model):
    question = models.OneToOneField(Question, on_delete=models.CASCADE, related_name='answer')
    text = models.TextField()
    audio = models.FileField(upload_to='answers/audio/', null=True, blank=True)
    video = models.FileField(upload_to='answers/video/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    analysis = models.JSONField(default=dict)