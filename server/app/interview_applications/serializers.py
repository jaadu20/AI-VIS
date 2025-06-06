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
    job = serializers.IntegerField(min_value=1) 
    
class ScheduleInterviewSerializer(serializers.Serializer):
    cv = serializers.FileField()
    job = serializers.IntegerField()  
    interview_date = serializers.DateField()
    interview_time = serializers.CharField()