from rest_framework import serializers
from .models import Application

class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company.company_profile.company_name', read_only=True)
    candidate_name = serializers.CharField(source='candidate.name', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'candidate', 'job', 'cv', 'applied_at', 'status',
            'match_score', 'missing_skills', 'job_title', 'company_name',
            'candidate_name'
        ]
        read_only_fields = ['candidate', 'applied_at', 'status']

class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['job', 'cv']
        extra_kwargs = {
            'cv': {'required': True},
            'job': {'required': True}
        }