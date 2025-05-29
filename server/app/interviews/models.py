# interviews/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
import os

User = get_user_model()

def audio_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('interview_audio', filename)

def video_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('interview_video', filename)

class Interview(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.OneToOneField('interview_applications.Application', on_delete=models.CASCADE, related_name='interview')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    current_question_index = models.IntegerField(default=0)
    total_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Interview for {self.application.user.username} - {self.application.job.title}"
    
    class Meta:
        ordering = ['-created_at']

class Question(models.Model):
    DIFFICULTY_CHOICES = (
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    )
    
    QUESTION_TYPE_CHOICES = (
        ('predefined', 'Predefined'),
        ('generated', 'Generated'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES)
    order = models.IntegerField()
    audio_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Question {self.order} - {self.interview}"
    
    class Meta:
        ordering = ['order']

class Answer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.OneToOneField(Question, on_delete=models.CASCADE, related_name='answer')
    text = models.TextField()
    audio_file = models.FileField(upload_to=audio_upload_path, blank=True, null=True)
    video_file = models.FileField(upload_to=video_upload_path, blank=True, null=True)
    
    # Scores
    content_score = models.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        null=True, blank=True
    )
    audio_score = models.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        null=True, blank=True
    )
    video_score = models.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        null=True, blank=True
    )
    overall_score = models.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        null=True, blank=True
    )
    
    feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Answer for {self.question}"
    
    def calculate_overall_score(self):
        """Calculate overall score from individual scores"""
        scores = []
        if self.content_score is not None:
            scores.append(float(self.content_score) * 0.6)  # 60% weight
        if self.audio_score is not None:
            scores.append(float(self.audio_score) * 0.2)   # 20% weight
        if self.video_score is not None:
            scores.append(float(self.video_score) * 0.2)   # 20% weight
        
        if scores:
            self.overall_score = sum(scores)
            self.save()
        return self.overall_score