# interviews/serializers.py
from rest_framework import serializers
from .models import Interview, Question, Answer

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'
        read_only_fields = ('interview', 'order', 'created_at')

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = '__all__'
        read_only_fields = ('question', 'created_at')

class InterviewSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    interview_id = serializers.UUIDField(source='id', read_only=True)
    
    class Meta:
        model = Interview
        fields = ['interview_id', 'application', 'user', 'start_time', 'questions']
        read_only_fields = ('user', 'start_time', 'status', 'total_score')