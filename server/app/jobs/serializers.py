from rest_framework import serializers
from .models import JobPosting
from django.contrib.auth import get_user_model

User = get_user_model()

class JobPostingSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'description', 'location', 
            'requirements', 'posted_at', 'is_active',
            'salary_range', 'job_type', 'company_name'
        ]
        extra_kwargs = {
            'company': {'write_only': True}
        }