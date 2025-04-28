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
from .services import GroqQuestionGenerator, AzureSpeechService
from job_applications.models import Application
from rest_framework_simplejwt.authentication import JWTAuthentication

class StartInterviewView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        try:
            application_id = request.data.get('application_id')
            application = Application.objects.get(
                id=application_id,
                applicant=request.user
            )
            
            # Get or create interview
            interview, created = Interview.objects.get_or_create(
                application=application,
                defaults={
                    'interview_id': uuid.uuid4(),
                    'difficulty': difficulty_map.get(
                        application.job.experience_level, 
                        'medium'
                    )
                }
            )

            if created:
                # Create initial questions only for new interviews
                predefined = [
                    "Walk me through your relevant experience for this role",
                    "What interests you about this position?",
                ]
                for idx, text in enumerate(predefined):
                    Question.objects.create(
                        interview=interview,
                        text=text,
                        order=idx,
                        is_predefined=True
                    )

                # Generate first technical question
                generator = GroqQuestionGenerator()
                job = application.job
                job_context = f"""
                Job Title: {job.title}
                Requirements: {job.requirements}
                Description: {job.description}
                """
                
                generated = generator.generate_question(
                    context=job_context,
                    previous_answers=[],
                    difficulty=interview.difficulty
                )
                
                Question.objects.create(
                    interview=interview,
                    text=generated['question'],
                    order=2
                )

            return Response({
                'interview_id': str(interview.interview_id),
                'current_question': interview.current_question,
                'questions': [{'text': q.text} for q in interview.questions.all()],
                'difficulty': interview.difficulty
            }, status=status.HTTP_201_CREATED)

        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# class StartInterviewView(APIView):
#     authentication_classes = [JWTAuthentication]  
#     permission_classes = [IsAuthenticated]
#     parser_classes = [JSONParser]

#     def post(self, request):
#         try:
#             application_id = request.data.get('application_id')
#             application = Application.objects.get(
#                 id=application_id,
#                 applicant=request.user
#             )
#             job = application.job
            
#             difficulty_map = {
#                 'entry': 'easy',
#                 'mid': 'medium',
#                 'senior': 'hard',
#                 'lead': 'hard'
#             }
            
#             interview = Interview.objects.create(
#                 application=application,
#                 interview_id=uuid.uuid4(),
#                 difficulty=difficulty_map.get(job.experience_level, 'medium')
#             )

#             # Initial questions
#             predefined = [
#                 "Walk me through your relevant experience for this role",
#                 "What interests you about this position?",
#             ]
#             for idx, text in enumerate(predefined):
#                 Question.objects.create(
#                     interview=interview,
#                     text=text,
#                     order=idx,
#                     is_predefined=True
#                 )

#             # Generate first technical question
#             generator = GroqQuestionGenerator()
#             job_context = f"""
#             Job Title: {job.title}
#             Requirements: {job.requirements}
#             Description: {job.description}
#             """
            
#             generated = generator.generate_question(
#                 context=job_context,
#                 previous_answers=[],
#                 difficulty=interview.difficulty
#             )
            
#             Question.objects.create(
#                 interview=interview,
#                 text=generated['question'],
#                 order=2
#             )

#             return Response({
#                 'interview_id': str(interview.interview_id),
#                 'current_question': 0,
#                 'questions': [{'text': q.text} for q in interview.questions.all()],
#                 'difficulty': interview.difficulty
#             }, status=status.HTTP_201_CREATED)

#         except Application.DoesNotExist:
#             return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            answer_data = {'text': '', 'analysis': {}}

            # Process files
            if 'audio' in request.FILES:
                audio_file = request.FILES['audio']
                answer_data['audio'] = ContentFile(
                    audio_file.read(),
                    name=f"audio_q{interview.current_question}.webm"
                )
                
                # STT processing
                speech_service = AzureSpeechService()
                audio_data = audio_file.read()
                answer_data['text'] = speech_service.speech_to_text(audio_data) or ""

            if 'video' in request.FILES:
                video_file = request.FILES['video']
                answer_data['video'] = ContentFile(
                    video_file.read(),
                    name=f"video_q{interview.current_question}.webm"
                )

            Answer.objects.update_or_create(
                question=current_question,
                defaults=answer_data
            )

            # Generate next question if needed
            next_question = None
            if 2 <= interview.current_question < 14:
                generator = GroqQuestionGenerator()
                prev_answers = list(interview.questions.filter(order__lte=interview.current_question))
                
                job_context = f"""
                Job Title: {interview.application.job.title}
                Requirements: {interview.application.job.requirements}
                """
                
                generated = generator.generate_question(
                    context=job_context,
                    previous_answers=[{
                        'question': q.text,
                        'answer': q.answer.text if hasattr(q, 'answer') else ''
                    } for q in prev_answers],
                    difficulty=interview.difficulty
                )
                
                next_question = Question.objects.create(
                    interview=interview,
                    text=generated['question'],
                    order=interview.current_question + 1
                )

            # Update progress
            interview.current_question += 1
            if interview.current_question >= 15:
                interview.completed = True
            interview.save()

            return Response({
                'current_question': interview.current_question,
                'is_completed': interview.completed,
                'next_question': next_question.text if next_question else None
            })

        except Interview.DoesNotExist:
            return Response({'error': 'Interview not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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