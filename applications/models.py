from django.db import models
from users.models import User
from jobs.models import Job

class Application(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('interviewing', 'Interviewing'),
        ('rejected', 'Rejected')
    ]

    candidate = models.ForeignKey(User, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    cv = models.FileField(upload_to='application_cvs/')
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    match_score = models.FloatField(null=True)
    missing_skills = models.TextField(null=True)
    raw_analysis = models.JSONField(default=dict)

    class Meta:
        unique_together = ['candidate', 'job']

    def __str__(self):
        return f"{self.candidate.email} - {self.job.title}"