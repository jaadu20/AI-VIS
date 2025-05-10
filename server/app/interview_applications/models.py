# applications/models.py
from django.db import models
from users.models import User, CandidateProfile
from jobs.models import Job
import uuid

class Application(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('reviewing', 'Reviewing'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('interview', 'Interview'),
        ('completed', 'Completed'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    cv = models.FileField(upload_to='applications/cvs/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    eligible = models.BooleanField(default=False)
    match_score = models.FloatField(default=0.0)
    extracted_skills = models.JSONField(default=list)
    missing_skills = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.candidate.name} - {self.job.title}"

class Interview(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('evaluated', 'Evaluated'),
    )
    
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='interview')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(default=0.0)
    feedback = models.TextField(blank=True)
    
    def __str__(self):
        return f"Interview for {self.application}"

class InterviewQuestion(models.Model):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Q{self.order}: {self.question_text[:30]}..."

class InterviewAnswer(models.Model):
    question = models.OneToOneField(InterviewQuestion, on_delete=models.CASCADE, related_name='answer')
    answer_text = models.TextField(blank=True)
    score = models.FloatField(default=0.0)
    feedback = models.TextField(blank=True)
    
    def __str__(self):
        return f"Answer to Q{self.question.order}"