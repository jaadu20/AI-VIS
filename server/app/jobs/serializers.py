# jobs/serializers.py
from rest_framework import serializers
from .models import Job

class JobSerializer(serializers.ModelSerializer):
    employment_type = serializers.ChoiceField(choices=Job.EMPLOYMENT_TYPES)
    experience_level = serializers.ChoiceField(choices=Job.EXPERIENCE_LEVELS)

    class Meta:
        model = Job
        fields = [
            'id', 'company', 'title', 'department', 'location',
            'employment_type', 'experience_level', 'salary',
            'description', 'requirements', 'benefits', 'created_at'
        ]
        extra_kwargs = {
            'company': {'read_only': True},
            'created_at': {'read_only': True},
        }

    def validate_employment_type(self, value):
        return value.lower()

    def create(self, validated_data):
        validated_data['company'] = self.context['request'].user
        return super().create(validated_data)
