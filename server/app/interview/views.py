# interviews/views.py
# interviews/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, JSONParser
from django.core.files.base import ContentFile
import uuid
import json
from .models import Interview, Question, Answer
from .services import InterviewManager, AzureSpeechService, GroqAnswerAnalyzer
from job_applications.models import Application

class StartInterviewView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            application = Application.objects.get(
                id=request.data.get('application_id'),
                applicant=request.user,
                status='eligible'
            )
            
            # Create interview
            interview = Interview.objects.create(
                application=application,
                difficulty=application.job.experience_level
            )
            
            # Generate questions
            manager = InterviewManager(interview)
            questions = manager.generate_questions()
            
            # Save questions
            for q in questions:
                Question.objects.create(
                    interview=interview,
                    text=q['text'],
                    order=q['order'],
                    is_predefined=q['is_predefined'],
                    difficulty=q['difficulty']
                )
            
            return Response({
                'interview_id': str(interview.interview_id),
                'current_question': 0,
                'questions': [q['text'] for q in questions]
            }, status=status.HTTP_201_CREATED)
            
        except Application.DoesNotExist:
            return Response({'error': 'Invalid application'}, status=status.HTTP_400_BAD_REQUEST)

class SubmitAnswerView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request, interview_id):
        try:
            interview = Interview.objects.get(
                interview_id=interview_id,
                application__applicant=request.user
            )
            if interview.completed:
                return Response({'error': 'Interview completed'}, status=status.HTTP_400_BAD_REQUEST)

            current_question = interview.questions.get(order=interview.current_question)
            
            # Process answer
            answer_text = request.data.get('text', '')
            if 'audio' in request.FILES:
                audio_file = request.FILES['audio']
                speech_service = AzureSpeechService()
                answer_text = speech_service.speech_to_text(audio_file.read()) or answer_text

            # Save answer
            answer, created = Answer.objects.update_or_create(
                question=current_question,
                defaults={
                    'text': answer_text,
                    'audio': request.FILES.get('audio'),
                    'video': request.FILES.get('video')
                }
            )

            # Score answer for dynamic questions
            if interview.current_question >= 2:
                analyzer = GroqAnswerAnalyzer()
                score = analyzer.analyze_answer(
                    current_question.text,
                    answer_text
                )
                current_question.answer_score = score
                current_question.save()
                interview.total_score += score
                interview.save()

            # Generate next question
            if interview.current_question < 14:
                interview.current_question += 1
                interview.save()
                
                next_question = interview.questions.get(order=interview.current_question)
                return Response({
                    'current_question': interview.current_question,
                    'question': next_question.text,
                    'difficulty': next_question.difficulty
                })
                
            else:
                interview.completed = True
                interview.save()
                return Response({
                    'completed': True,
                    'total_score': interview.total_score
                })

        except Interview.DoesNotExist:
            return Response({'error': 'Invalid interview'}, status=status.HTTP_404_NOT_FOUND)

class InterviewResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, interview_id):
        try:
            interview = Interview.objects.get(
                interview_id=interview_id,
                application__applicant=request.user
            )
            
            results = {
                'total_score': interview.total_score,
                'average_score': interview.total_score / 15,
                'questions': []
            }
            
            for question in interview.questions.all():
                results['questions'].append({
                    'question': question.text,
                    'difficulty': question.difficulty,
                    'score': question.answer_score or 'N/A',
                    'answer': question.answer.text if hasattr(question, 'answer') else ''
                })
            
            return Response(results)
            
        except Interview.DoesNotExist:
            return Response({'error': 'Interview not found'}, status=status.HTTP_404_NOT_FOUND)

class AzureTTSView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        text = request.data.get('text')
        if not text:
            return Response({'error': 'Text required'}, status=status.HTTP_400_BAD_REQUEST)
        
        speech_service = AzureSpeechService()
        audio_data = speech_service.text_to_speech(text)
        
        if audio_data:
            return Response(audio_data, content_type='audio/wav')
        return Response({'error': 'TTS failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AzureSTTView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        if 'audio' not in request.FILES:
            return Response({'error': 'Audio file required'}, status=status.HTTP_400_BAD_REQUEST)
        
        speech_service = AzureSpeechService()
        audio_file = request.FILES['audio']
        text = speech_service.speech_to_text(audio_file.read())
        
        if text:
            return Response({'text': text})
        return Response({'error': 'STT failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)