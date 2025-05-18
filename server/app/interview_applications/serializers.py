# interview_applications/serializers.py
from rest_framework import serializers
from .models import Application
from jobs.serializers import JobSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    job_details = JobSerializer(source='job', read_only=True)
    
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['id', 'user', 'status', 'match_score', 'missing_skills', 'feedback']

class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['job', 'cv']
        
class EligibilityCheckSerializer(serializers.Serializer):
    cv = serializers.FileField()
    job = serializers.UUIDField()
    
class ScheduleInterviewSerializer(serializers.Serializer):
    cv = serializers.FileField()
    job = serializers.UUIDField()
    interview_date = serializers.DateField()
    interview_time = serializers.CharField()