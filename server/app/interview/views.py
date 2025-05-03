# interviews/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from django.utils import timezone
from django.db import transaction
from .models import Interview, Question, Answer
from job_applications.models import Application
from jobs.models import Job
from users.models import User
from .services import InterviewManager, AzureSpeechService
import uuid
import logging

logger = logging.getLogger(__name__)

class StartInterviewView(APIView):
    permission_classes = [IsAuthenticated]
    
    def create_dummy_application(self, user):
        with transaction.atomic():
            # Create dummy job with correct field names
            dummy_job = Job.objects.create(
                title="Practice Interview",
                company="AI Interview System",
                location="Remote",
                description="Practice session for interview preparation",
                requirements="No specific requirements",
                salary_range="Competitive",
                employment_type="Full-time",
                posted_at=timezone.now()
            )
            
            # Create dummy application
            return Application.objects.create(
                applicant=user,
                job=dummy_job,
                status='eligible',
                skills_matched=["Communication", "Problem Solving"],
                requirements_matched=["Basic knowledge"]
            )

    def post(self, request):
        try:
            user = request.user
            application = None
            
            if 'application_id' in request.data:
                try:
                    application = Application.objects.get(
                        id=request.data['application_id'],
                        applicant=user,
                        status__in=['eligible', 'interviewing']
                    )
                except Application.DoesNotExist:
                    logger.warning(f"Invalid application ID {request.data.get('application_id')} from user {user.id}")
            
            if not application:
                application = self.create_dummy_application(user)

            interview = Interview.objects.create(
                application=application,
                interview_id=uuid.uuid4()
            )
            
            manager = InterviewManager(interview)
            questions = manager.generate_initial_questions()
            
            Question.objects.bulk_create([
                Question(
                    interview=interview,
                    text=q['text'],
                    order=q['order'],
                    is_predefined=q.get('is_predefined', False),
                    difficulty=q.get('difficulty', 'easy')
                ) for q in questions
            ])
            
            return Response({
                'interview_id': str(interview.interview_id),
                'current_question': 0,
                'questions': [q['text'] for q in questions]
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Interview start failed: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to initialize interview session'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SubmitAnswerView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request, interview_id):
        try:
            interview = Interview.objects.get(
                interview_id=interview_id,
                application__applicant=request.user
            )
            current_question = interview.questions.get(order=interview.current_question)
            
            answer_text = request.data.get('text', '')
            if 'audio' in request.FILES:
                audio_file = request.FILES['audio'].read()
                answer_text = AzureSpeechService().speech_to_text(audio_file) or answer_text
            
            answer = Answer.objects.create(
                question=current_question,
                text=answer_text,
                audio=request.FILES.get('audio')
            )
            
            manager = InterviewManager(interview)
            analysis = manager.analyze_answer(current_question, answer_text)
            
            if interview.current_question < 14:
                next_q = manager.generate_next_question()
                Question.objects.create(
                    interview=interview,
                    text=next_q['question'],
                    order=interview.current_question + 1,
                    difficulty=next_q.get('difficulty', 'medium')
                )
                interview.current_question += 1
                interview.save()
                
                return Response({
                    'current_question': interview.current_question,
                    'question': next_q['question'],
                    'difficulty': next_q.get('difficulty', 'medium')
                })
                
            else:
                interview.completed = True
                interview.save()
                return Response({
                    'completed': True,
                    'total_score': interview.total_score,
                    'average_score': interview.total_score / 15
                })

        except Interview.DoesNotExist:
            return Response({'error': 'Invalid interview'}, status=status.HTTP_404_NOT_FOUND)