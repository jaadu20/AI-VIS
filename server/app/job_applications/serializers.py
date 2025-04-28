# job application serializer.py

from rest_framework import serializers
from .models import Application
from jobs.models import Job
from django.core.validators import FileExtensionValidator
from .validators import validate_file_size

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['id', 'applicant', 'job', 'status', 'applied_at', 'cv']
        extra_kwargs = {
            'applicant': {'read_only': True},
            'status': {'read_only': True},
        }


class EligibilityCheckSerializer(serializers.Serializer):
    cv = serializers.FileField(
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf']),
            validate_file_size
        ]
    )