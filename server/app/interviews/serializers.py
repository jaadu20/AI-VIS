# interviews/serializers.py
from rest_framework import serializers
from .models import Interview, Question, Answer

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = [
            'id', 'text', 'audio_file', 'video_file',
            'content_score', 'audio_score', 'video_score', 
            'overall_score', 'feedback', 'created_at'
        ]

class QuestionSerializer(serializers.ModelSerializer):
    answer = AnswerSerializer(read_only=True)
    
    class Meta:
        model = Question
        fields = [
            'id', 'text', 'difficulty', 'question_type', 
            'order', 'audio_url', 'answer', 'created_at'
        ]

class InterviewSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Interview
        fields = [
            'id', 'application', 'status', 'current_question_index',
            'total_score', 'started_at', 'completed_at', 
            'questions', 'created_at', 'updated_at'
        ]