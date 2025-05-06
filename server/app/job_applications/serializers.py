# # job_applications/serializers.py

# from rest_framework import serializers
# from django.core.validators import FileExtensionValidator
# from .models import Application
# from .validators import validate_file_size
# from jobs.models import Job
# class ApplicationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Application
#         fields = '__all__'
#         read_only_fields = ['applicant', 'status', 'applied_at']

# class EligibilityCheckSerializer(serializers.Serializer):
#     cv = serializers.FileField(
#         validators=[
#             FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx']),
#             validate_file_size
#         ]
#     )
#     job = serializers.PrimaryKeyRelatedField(queryset=Job.objects.all())