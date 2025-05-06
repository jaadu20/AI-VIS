# from jobs.models import Job
# from .models import Application
    

# def create_dummy_job(user):
#     dummy_job = Job(
#         title="Senior Software Engineer",
#         company_name="AI Tech Solutions",
#         location="Remote",
#         description="Developing cutting-edge AI solutions using Python and machine learning.",
#         requirements="5+ years Python experience\nExperience with AI/ML frameworks",
#         experience_level="senior"
#     )
#     dummy_job.save()
    
#     application = Application(
#         applicant=user,
#         job=dummy_job,
#         status='eligible',
#         skills_matched=["Python", "Machine Learning", "TensorFlow"],
#         requirements_matched=dummy_job.requirements.split('\n')
#     )
#     application.save()
    
#     return application