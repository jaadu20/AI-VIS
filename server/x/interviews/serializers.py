from rest_framework import serializers
from .models import Interview, Answer

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = '__all__'

class InterviewSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Interview
        fields = ['id', 'candidate', 'job_id', 'created_at', 'is_completed', 'final_score', 'feedback', 'answers']
