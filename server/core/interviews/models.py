from django.db import models

class InterviewSession(models.Model):
    candidate = models.ForeignKey(User, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed')
    ])
    current_question = models.IntegerField(default=0)

class InterviewQuestion(models.Model):
    session = models.ForeignKey(InterviewSession, on_delete=models.CASCADE)
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=[
        ('basic', 'Basic'),
        ('adaptive', 'Adaptive')
    ])
    difficulty = models.CharField(max_length=10, choices=[
        ('easy', 'Easy'), 
        ('medium', 'Medium'),
        ('hard', 'Hard')
    ])
    order = models.IntegerField()

class CandidateAnswer(models.Model):
    question = models.ForeignKey(InterviewQuestion, on_delete=models.CASCADE)
    transcript = models.TextField()
    audio_path = models.CharField(max_length=255)
    video_path = models.CharField(max_length=255)
    nlp_score = models.FloatField(null=True)
    voice_score = models.FloatField(null=True)
    facial_score = models.FloatField(null=True)
    timestamp = models.DateTimeField(auto_now_add=True)