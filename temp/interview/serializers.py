# from rest_framework import serializers
# from .models import Interview, Question, Answer

# class QuestionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Question
#         fields = [
#             'id', 'text', 'order', 'difficulty', 'generated_by',
#             'created_at'
#         ]
#         read_only_fields = [
#             'id', 'order', 'difficulty', 'generated_by', 'created_at'
#         ]

# class AnswerSerializer(serializers.ModelSerializer):
#     question_text = serializers.CharField(source='question.text', read_only=True)
    
#     class Meta:
#         model = Answer
#         fields = [
#             'id', 'question', 'question_text', 'text', 'score',
#             'sentiment', 'emotions', 'created_at'
#         ]
#         read_only_fields = [
#             'id', 'score', 'sentiment', 'emotions', 'created_at'
#         ]
#         extra_kwargs = {
#             'question': {'write_only': True}
#         }

# class InterviewSerializer(serializers.ModelSerializer):
#     questions = QuestionSerializer(many=True, read_only=True)
#     answers = AnswerSerializer(many=True, read_only=True)
#     progress = serializers.SerializerMethodField()
#     current_question = serializers.SerializerMethodField()

#     class Meta:
#         model = Interview
#         fields = [
#             'id', 'candidate', 'job_posting', 'start_time', 'end_time',
#             'status', 'overall_score', 'questions', 'answers', 'progress',
#             'current_question', 'emotion_data', 'sentiment_data'
#         ]
#         read_only_fields = [
#             'id', 'start_time', 'end_time', 'status', 'overall_score',
#             'questions', 'answers', 'progress', 'current_question',
#             'emotion_data', 'sentiment_data'
#         ]

#     def get_progress(self, obj):
#         total_questions = 15  # Fixed 15 questions per interview
#         answered = obj.answers.count()
#         return {
#             'total': total_questions,
#             'answered': answered,
#             'percentage': int((answered / total_questions) * 100)
#         }

#     def get_current_question(self, obj):
#         current_q = obj.questions.order_by('order').last()
#         return QuestionSerializer(current_q).data if current_q else None

# class InterviewCreateSerializer(serializers.ModelSerializer):
#     job_id = serializers.IntegerField(write_only=True)

#     class Meta:
#         model = Interview
#         fields = ['job_id']
#         read_only_fields = []

#     def create(self, validated_data):
#         return Interview.objects.create(
#             candidate=self.context['request'].user,
#             job_posting_id=validated_data['job_id']
#         )