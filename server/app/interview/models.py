from django.db import models
from users.models import User
from jobs.models import Job  

class Interview(models.Model):
    DIFFICULTY_LEVELS = (
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job_posting = models.ForeignKey(Job, on_delete=models.CASCADE)
    questions = models.JSONField(default=list)  
    answers = models.JSONField(default=list)    
    results = models.JSONField(default=dict)  
    difficulty_level = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.email} - {self.job_posting.title}"