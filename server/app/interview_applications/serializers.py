# interview_applications/serializers.py
import uuid
from rest_framework import serializers
from .models import Application
from jobs.serializers import JobSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    job_details = JobSerializer(source='job', read_only=True)
    missing_skills = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['id', 'user', 'status', 'match_score', 'missing_skills', 'feedback']

    def get_missing_skills(self, obj):
        if obj.missing_skills:
            return obj.missing_skills.split(', ')
        return []

class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['job', 'cv']
        
class EligibilityCheckSerializer(serializers.Serializer):
    cv = serializers.FileField()
    job = serializers.CharField()  # Changed from UUIDField to CharField
    
    def validate_job(self, value):
        """
        Validate and convert job ID to UUID format
        """
        try:
            # Try to convert to UUID
            return uuid.UUID(str(value))
        except ValueError:
            # If it fails, raise validation error
            raise serializers.ValidationError("Invalid job ID format.")
    
class ScheduleInterviewSerializer(serializers.Serializer):
    cv = serializers.FileField()
    job = serializers.UUIDField()
    interview_date = serializers.DateField()
    interview_time = serializers.CharField()