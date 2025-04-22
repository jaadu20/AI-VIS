from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Interview(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job_id = models.CharField(max_length=100)
    current_question = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed')
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    overall_score = models.FloatField(default=0)
    emotion_data = models.JSONField(default=dict)
    sentiment_data = models.JSONField(default=dict)

class Question(models.Model):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    order = models.PositiveIntegerField()
    difficulty = models.CharField(max_length=10)
    generated_by = models.CharField(max_length=20)
    answer = models.TextField(null=True)
    score = models.FloatField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)

# from django.db import models
# from django.contrib.auth import get_user_model

# User = get_user_model()

# class Interview(models.Model):
#     candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interviews')
#     job_posting = models.ForeignKey('company.JobPosting', on_delete=models.CASCADE)
#     start_time = models.DateTimeField(auto_now_add=True)
#     end_time = models.DateTimeField(null=True, blank=True)
#     overall_score = models.FloatField(default=0)
#     status = models.CharField(max_length=20, choices=[
#         ('pending', 'Pending'),
#         ('started', 'Started'),
#         ('completed', 'Completed')
#     ], default='pending')
#     emotion_data = models.JSONField(default=dict)
#     sentiment_data = models.JSONField(default=dict)

# class Question(models.Model):
#     interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='questions')
#     text = models.TextField()
#     order = models.IntegerField()
#     difficulty = models.CharField(max_length=10, choices=[
#         ('easy', 'Easy'),
#         ('medium', 'Medium'),
#         ('hard', 'Hard')
#     ])
#     generated_by = models.CharField(max_length=20, choices=[
#         ('static', 'Static'),
#         ('llama', 'Llama-3.1')
#     ])

# class Answer(models.Model):
#     question = models.OneToOneField(Question, on_delete=models.CASCADE, related_name='answer')
#     text = models.TextField()
#     score = models.FloatField()
#     sentiment = models.JSONField()
#     emotions = models.JSONField()
#     created_at = models.DateTimeField(auto_now_add=True)