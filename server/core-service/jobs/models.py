from django.db import models
from users.models import User

class Job(models.Model):
    company = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

class Application(models.Model):
    candidate = models.ForeignKey(User, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default='pending')  # pending/accepted/rejected
    applied_at = models.DateTimeField(auto_now_add=True)