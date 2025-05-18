# from rest_framework import serializers
# from .models import (
#     Question, Interview, InterviewQuestion, Answer, 
#     InterviewResult, JobPosition
# )


# class QuestionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Question
#         fields = ['id', 'text', 'difficulty', 'category', 'is_predefined']


# class JobPositionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = JobPosition
#         fields = ['id', 'title', 'description']


# class AnswerSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Answer
#         fields = ['id', 'text', 'audio_file', 'timestamp', 'relevance_score', 
#                  'clarity_score', 'confidence_score', 'technical_accuracy', 
#                  'overall_score', 'analysis_notes']
#         read_only_fields = ['relevance_score', 'clarity_score', 'confidence_score', 
#                           'technical_accuracy', 'overall_score', 'analysis_notes']


# class InterviewQuestionSerializer(serializers.ModelSerializer):
#     question = QuestionSerializer()
#     answer = AnswerSerializer(read_only=True)
    
#     class Meta:
#         model = InterviewQuestion
#         fields = ['id', 'position', 'question', 'answer']


# class InterviewSerializer(serializers.ModelSerializer):
#     questions = InterviewQuestionSerializer(many=True, read_only=True)
#     job_position = JobPositionSerializer(read_only=True)
    
#     class Meta:
#         model = Interview
#         fields = ['id', 'user', 'job_position', 'start_time', 'end_time', 
#                  'status', 'application_id', 'overall_score', 'confidence_score',
#                  'communication_score', 'technical_score', 'duration', 'questions']
#         read_only_fields = ['start_time', 'end_time', 'overall_score', 
#                           'confidence_score', 'communication_score', 
#                           'technical_score', 'duration']


# class InterviewResultSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = InterviewResult
#         fields = ['id', 'interview', 'summary', 'strengths', 
#                  'areas_for_improvement', 'recommendations', 'generated_at']
#         read_only_fields = ['generated_at']


# class AudioToTextSerializer(serializers.Serializer):
#     audio = serializers.FileField()


# class TextToSpeechSerializer(serializers.Serializer):
#     text = serializers.CharField()


# class AnswerSubmitSerializer(serializers.Serializer):
#     text = serializers.CharField()
#     audio = serializers.FileField(required=False)


# class InterviewStartSerializer(serializers.Serializer):
#     application_id = serializers.CharField(required=False)
#     job_position_id = serializers.IntegerField(required=False)