# from rest_framework import serializers
# from .models import InterviewSession, InterviewQuestion, JobPosting

# class JobPostingSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = JobPosting
#         fields = '__all__'

# class InterviewQuestionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = InterviewQuestion
#         fields = '__all__'
        
# class InterviewSessionSerializer(serializers.ModelSerializer):
#     questions = InterviewQuestionSerializer(many=True, read_only=True)
    
#     class Meta:
#         model = InterviewSession
#         fields = '__all__'
