# interviews/models.py
from django.db import models
from django.conf import settings

class Question(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    text = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    category = models.CharField(max_length=100, blank=True)
    is_predefined = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.text[:50]}... ({self.difficulty})"


class JobPosition(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.title


class Interview(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interviews')
    job_position = models.ForeignKey(JobPosition, on_delete=models.SET_NULL, null=True, blank=True)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    application_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Overall interview metrics calculated at the end
    overall_score = models.FloatField(null=True, blank=True)
    confidence_score = models.FloatField(null=True, blank=True)
    communication_score = models.FloatField(null=True, blank=True)
    technical_score = models.FloatField(null=True, blank=True)
    
    def __str__(self):
        return f"Interview {self.id} - {self.user.username} - {self.status}"
    
    @property
    def duration(self):
        if self.end_time and self.start_time:
            return (self.end_time - self.start_time).total_seconds()
        return None


class InterviewQuestion(models.Model):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='questions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    position = models.PositiveIntegerField()  # Order in the interview
    
    def __str__(self):
        return f"Q{self.position}: {self.question.text[:30]}..."
    
    class Meta:
        ordering = ['position']


class Answer(models.Model):
    interview_question = models.OneToOneField(InterviewQuestion, on_delete=models.CASCADE, related_name='answer')
    text = models.TextField()
    audio_file = models.FileField(upload_to='interview_answers/', null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # AI analysis scores
    relevance_score = models.FloatField(null=True, blank=True)
    clarity_score = models.FloatField(null=True, blank=True)
    confidence_score = models.FloatField(null=True, blank=True)
    technical_accuracy = models.FloatField(null=True, blank=True)
    overall_score = models.FloatField(null=True, blank=True)
    
    analysis_notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"Answer to Q{self.interview_question.position}"


class InterviewResult(models.Model):
    interview = models.OneToOneField(Interview, on_delete=models.CASCADE, related_name='result')
    summary = models.TextField()
    strengths = models.TextField()
    areas_for_improvement = models.TextField()
    recommendations = models.TextField()
    generated_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Result for Interview {self.interview.id}"