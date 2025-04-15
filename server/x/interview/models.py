from django.db import models

class InterviewSession(models.Model):
    candidate_name = models.CharField(max_length=255, blank=True, null=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"InterviewSession {self.pk}"


class InterviewQuestion(models.Model):
    session = models.ForeignKey(InterviewSession, related_name='questions', on_delete=models.CASCADE)
    question_text = models.TextField()
    order = models.PositiveIntegerField()  # e.g., 1 to 15

    def __str__(self):
        return f"Q{self.order}: {self.question_text}"


class CandidateAnswer(models.Model):
    question = models.ForeignKey(InterviewQuestion, related_name='answers', on_delete=models.CASCADE)
    answer_text = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer for Q{self.question.order}"

class Question(models.Model):
    job_id = models.IntegerField()
    candidate_id = models.IntegerField()
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    candidate_id = models.IntegerField()
    answer_text = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)