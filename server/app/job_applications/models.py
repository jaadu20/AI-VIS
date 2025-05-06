# # job_applications/models.py

# from django.db import models
# from users.models import User
# from jobs.models import Job

# class Application(models.Model):
#     STATUS_CHOICES = [
#         ('applied', 'Applied'),
#         ('under_review', 'Under Review'),
#         ('eligible', 'Eligible'),
#         ('not_eligible', 'Not Eligible'),
#         ('interviewing', 'Interviewing'),
#         ('rejected', 'Rejected'),
#         ('hired', 'Hired'),
#     ]

#     applicant = models.ForeignKey(User, on_delete=models.CASCADE)
#     job = models.ForeignKey(Job, on_delete=models.CASCADE)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
#     applied_at = models.DateTimeField(auto_now_add=True)
#     cv = models.FileField(upload_to='cvs/',default=None, null=True, blank=True)
#     match_score = models.FloatField(null=True, blank=True)
#     skills_matched = models.JSONField(default=list, blank=True)
#     requirements_matched = models.JSONField(default=list, blank=True)

#     def __str__(self):
#         return f"{self.applicant.email} - {self.job.title}"