# jobs/serializers.py
from rest_framework import serializers
from .models import Job

class JobSerializer(serializers.ModelSerializer):
    employment_type = serializers.ChoiceField(choices=Job.EMPLOYMENT_TYPES)
    experience_level = serializers.ChoiceField(choices=Job.EXPERIENCE_LEVELS)
    company_name = serializers.SerializerMethodField()
    # company_name = serializers.CharField(source="company.company_profile.name", default="Company")

    class Meta:
        model = Job
        fields = [
            'id', 'company', 'title', 'department', 'location',
            'employment_type', 'experience_level', 'salary',
            'description', 'requirements', 'benefits', 'created_at', 'company_name'
        ]
        extra_kwargs = {
            'company': {'read_only': True},
            'created_at': {'read_only': True},
        }

    def get_company_name(self, obj):
        return obj.company.company_profile.company_name if obj.company.company_profile else "Company"
    
    def validate_employment_type(self, value):
        return value.lower()

    def create(self, validated_data):
        validated_data['company'] = self.context['request'].user
        return super().create(validated_data)
