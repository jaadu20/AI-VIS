from django.db import models
from django.conf import settings


class Interview(models.Model):
    candidate = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    job_id = models.IntegerField()  
    created_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)
    final_score = models.FloatField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Interview {self.id} for candidate {self.candidate.username}"

class Answer(models.Model):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='answers')
    question = models.TextField()
    answer_text = models.TextField()
    content_score = models.IntegerField(null=True, blank=True)
    voice_score = models.IntegerField(null=True, blank=True)
    facial_score = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer {self.id} for Interview {self.interview.id}"
