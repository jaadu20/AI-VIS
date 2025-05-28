from django.db import models
from django.contrib.auth import get_user_model
from interview_applications.models import Application
import uuid

User = get_user_model()

class Interview(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    current_question = models.PositiveIntegerField(default=0)
    interview_data = models.JSONField(default=dict)  # Store questions, answers, scores

    def __str__(self):
        return f"Interview for {self.application.job.title}"

class InterviewQuestion(models.Model):
    DIFFICULTY_CHOICES = (
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    )
    
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    sequence = models.PositiveIntegerField()
    answer_text = models.TextField(null=True, blank=True)
    answer_audio = models.FileField(upload_to='interview_answers/', null=True, blank=True)
    score = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sequence']

    def __str__(self):
        return f"Q{self.sequence}: {self.question_text[:50]}..."