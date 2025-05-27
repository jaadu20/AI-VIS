# serializers.py
from rest_framework import serializers
from .models import Interview, Question, Answer, Application

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['question_number', 'text', 'difficulty', 'audio_url']

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['text', 'score', 'feedback', 'answered_at']

class InterviewSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Interview
        fields = ['id', 'status', 'current_question_number', 'total_score', 
                 'average_score', 'started_at', 'completed_at', 'questions']