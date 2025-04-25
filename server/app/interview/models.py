# interviews/models.py
from django.db import models
from job_applications.models import Application
from users.models import User

class Interview(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    application = models.ForeignKey(Application, on_delete=models.CASCADE)
    interview_id = models.UUIDField(unique=True)
    current_question = models.PositiveIntegerField(default=0)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.application.applicant.email} - {self.interview_id}"

class Question(models.Model):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    order = models.PositiveIntegerField()
    is_predefined = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']
        unique_together = ['interview', 'order']

class Answer(models.Model):
    question = models.OneToOneField(Question, on_delete=models.CASCADE, related_name='answer')
    text = models.TextField()
    audio = models.FileField(upload_to='answers/audio/', null=True, blank=True)
    video = models.FileField(upload_to='answers/video/', null=True, blank=True)
    analysis = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)