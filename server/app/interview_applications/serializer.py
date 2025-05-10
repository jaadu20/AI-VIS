from rest_framework import serializers
from .models import Application, Interview, InterviewQuestion, InterviewAnswer
from jobs.serializers import JobSerializer
from users.serializers import CandidateProfileSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    job_details = JobSerializer(source='job', read_only=True)
    candidate_name = serializers.CharField(source='candidate.name', read_only=True)
    
    class Meta:
        model = Application
        fields = [
            'id', 'candidate', 'job', 'cv', 'status', 'created_at', 
            'eligible', 'match_score', 'extracted_skills', 'missing_skills',
            'job_details', 'candidate_name'
        ]
        read_only_fields = ['id', 'created_at', 'eligible', 'match_score', 'extracted_skills', 'missing_skills']
        extra_kwargs = {
            'candidate': {'required': False},
            'job': {'required': True},
        }

class InterviewAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewAnswer
        fields = ['id', 'question', 'answer_text', 'score', 'feedback']
        read_only_fields = ['id', 'score', 'feedback']

class InterviewQuestionSerializer(serializers.ModelSerializer):
    answer = InterviewAnswerSerializer(read_only=True)
    
    class Meta:
        model = InterviewQuestion
        fields = ['id', 'question_text', 'order', 'answer']
        read_only_fields = ['id']

class InterviewSerializer(serializers.ModelSerializer):
    questions = InterviewQuestionSerializer(many=True, read_only=True)
    application_details = ApplicationSerializer(source='application', read_only=True)
    
    class Meta:
        model = Interview
        fields = ['id', 'application', 'status', 'start_time', 'end_time', 
                  'score', 'feedback', 'questions', 'application_details']
        read_only_fields = ['id', 'score', 'feedback']