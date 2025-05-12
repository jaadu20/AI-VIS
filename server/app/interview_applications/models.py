#interview_applications/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
import os

User = get_user_model()

def cv_upload_path(instance, filename):
    # Generate a unique filename for the CV to avoid collisions
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('cv_uploads', filename)

class Application(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('scheduled', 'Interview Scheduled'),
        ('completed', 'Interview Completed'),
        ('rejected', 'Rejected'),
        ('accepted', 'Accepted'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey('jobs.Job', on_delete=models.CASCADE, related_name='applications')
    cv = models.FileField(upload_to=cv_upload_path)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    match_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    missing_skills = models.TextField(blank=True, null=True)
    interview_date = models.DateField(null=True, blank=True)
    interview_time = models.CharField(max_length=20, null=True, blank=True)
    feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.job.title} application"
    
    class Meta:
        ordering = ['-created_at']