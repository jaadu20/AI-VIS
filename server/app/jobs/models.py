# jobs/models.py
from django.db import models
from users.models import User

class Job(models.Model):
    EMPLOYMENT_TYPES = (
        ('full-time', 'Full-time'),
        ('part-time', 'Part-time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('temporary', 'Temporary'),
    )
    
    EXPERIENCE_LEVELS = (
        ('entry', 'Entry Level'),
        ('mid', 'Mid Level'),
        ('senior', 'Senior Level'),
        ('lead', 'Lead'),
        ('director', 'Director'),
    )

    company = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPES)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVELS)
    salary = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField()
    requirements = models.TextField()
    benefits = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

   # In models.py - company_profile relation might not exist
def __str__(self):
    # Safer implementation:
    if hasattr(self.company, 'company_profile'):
        return f"{self.title} - {self.company.company_profile.company_name}"
    return f"{self.title} - {self.company.email}"