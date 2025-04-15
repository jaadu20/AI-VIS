# jobs/models.py
from django.db import models
from django.conf import settings

class JobPosting(models.Model):
    company = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        help_text="The company posting the job"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(help_text="Full job description including responsibilities and required skills")
    city = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
