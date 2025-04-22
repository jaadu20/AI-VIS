from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Interview, Question
from .utils.ai_utils import AIService
from .utils.azure_utils import AzureService
from .serializers import InterviewSerializer
import json

ai_service = AIService()
azure_service = AzureService()

class InterviewAPI(APIView):
    def post(self, request):
        user = request.user
        job_id = request.data.get('job_id')
        
        # Create new interview
        interview = Interview.objects.create(
            user=user,
            job_id=job_id,
            status='ongoing'
        )
        
        # Add initial questions
        Question.objects.bulk_create([
            Question(
                interview=interview,
                text="Tell me about yourself",
                order=1,
                difficulty="easy",
                generated_by="system"
            ),
            Question(
                interview=interview,
                text="Why do you want to apply for this job?",
                order=2,
                difficulty="easy",
                generated_by="system"
            )
        ])
        
        return Response({
            'interview_id': interview.id,
            'current_question': 1
        }, status=status.HTTP_201_CREATED)

class QuestionGenerationAPI(APIView):
    def post(self, request):
        interview_id = request.data.get('interview_id')
        previous_answer = request.data.get('previous_answer')
        
        try:
            interview = Interview.objects.get(id=interview_id)
            context = {
                'job_description': "Sample Job Description",  # Replace with actual JD
                'previous_answer': previous_answer
            }
            
            difficulty = self._calculate_difficulty(interview)
            question_text = ai_service.generate_question(context, difficulty)
            
            Question.objects.create(
                interview=interview,
                text=question_text,
                order=interview.current_question + 1,
                difficulty=difficulty,
                generated_by="ai"
            )
            
            return Response({'question': question_text})
        
        except Interview.DoesNotExist:
            return Response({'error': 'Interview not found'}, status=404)

    def _calculate_difficulty(self, interview):
        # Implement adaptive difficulty logic
        return "medium"

class AnswerProcessingAPI(APIView):
    def post(self, request):
        interview_id = request.data.get('interview_id')
        question_id = request.data.get('question_id')
        answer_text = request.data.get('answer')
        
        try:
            question = Question.objects.get(id=question_id)
            score = ai_service.score_answer(question.text, answer_text)
            
            # Update question with answer and score
            question.answer = answer_text
            question.score = score
            question.save()
            
            # Update interview progress
            interview = question.interview
            interview.current_question += 1
            if interview.current_question >= 15:
                interview.status = 'completed'
            interview.save()
            
            return Response({'score': score})
        
        except Question.DoesNotExist:
            return Response({'error': 'Question not found'}, status=404)

class TTSServiceAPI(APIView):
    def post(self, request):
        text = request.data.get('text')
        audio_file = azure_service.text_to_speech(text)
        return Response({'audio_url': audio_file})

class STTServiceAPI(APIView):
    def post(self, request):
        audio_file = request.FILES.get('audio')
        text = azure_service.speech_to_text(audio_file.temporary_file_path())
        return Response({'text': text})
    
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from .models import Interview, Question, Answer
# from .utils.ai_utils import QuestionGenerator, AnswerEvaluator
# from .utils.azure_utils import AzureServices
# import json

# azure = AzureServices()
# q_generator = QuestionGenerator()
# evaluator = AnswerEvaluator()

# class InterviewAPI(APIView):
#     def post(self, request):
#         # Initialize interview
#         interview = Interview.objects.create(
#             candidate=request.user,
#             job_posting_id=request.data.get('job_id'),
#             status='started'
#         )
        
#         # Create initial questions
#         Question.objects.bulk_create([
#             Question(
#                 interview=interview,
#                 text=text,
#                 order=idx,
#                 difficulty='static',
#                 generated_by='static'
#             )
#             for idx, text in enumerate([
#                 "Tell me about yourself",
#                 "Why do you want to apply for this job?"
#             ])
#         ])
        
#         return Response({
#             'interview_id': interview.id,
#             'first_question': interview.questions.first().text
#         }, status=status.HTTP_201_CREATED)

# class QuestionGenerationAPI(APIView):
#     def post(self, request):
#         interview = Interview.objects.get(id=request.data['interview_id'])
#         prev_answer = request.data['previous_answer']
#         job_desc = interview.job_posting.description
        
#         # Generate next question
#         difficulty = self._calculate_difficulty(interview)
#         question_text = q_generator.generate_question(job_desc, prev_answer, difficulty)
        
#         # Save new question
#         new_question = Question.objects.create(
#             interview=interview,
#             text=question_text,
#             order=interview.questions.count(),
#             difficulty=difficulty,
#             generated_by='llama'
#         )
        
#         return Response({'question': new_question.text})

#     def _calculate_difficulty(self, interview):
#         # Implement adaptive difficulty logic based on previous scores
#         return 'medium'

# class AnswerProcessingAPI(APIView):
#     def post(self, request):
#         question = Question.objects.get(id=request.data['question_id'])
        
#         # Score answer
#         score = evaluator.score_answer(
#             request.data['answer'],
#             question.text
#         )
        
#         # Create answer record
#         answer = Answer.objects.create(
#             question=question,
#             text=request.data['answer'],
#             score=score,
#             sentiment=json.loads(request.data.get('sentiment', '{}')),
#             emotions=json.loads(request.data.get('emotions', '{}'))
#         )
        
#         # Update interview progress
#         interview = question.interview
#         interview.overall_score = self._calculate_overall_score(interview)
#         interview.save()
        
#         return Response({'score': score})

#     def _calculate_overall_score(self, interview):
#         return round(
#             sum(a.score for a in interview.answers.all()) / interview.answers.count(),
#             1
#         )

# class SpeechServiceAPI(APIView):
#     def post(self, request):
#         if 'text' in request.data:
#             # TTS
#             audio_file = azure.text_to_speech(request.data['text'])
#             return Response(audio_file.read(), content_type='audio/mpeg')
#         elif 'audio' in request.FILES:
#             # STT
#             text = azure.speech_to_text(request.FILES['audio'])
#             return Response({'text': text})
#         return Response(status=status.HTTP_400_BAD_REQUEST)