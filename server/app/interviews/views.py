# interviews/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Interview, Question, Answer
from .serializers import InterviewSerializer, QuestionSerializer, AnswerSerializer
from .services import InterviewService
import tempfile
import os

class InterviewViewSet(viewsets.ModelViewSet):
    queryset = Interview.objects.all()
    serializer_class = InterviewSerializer
    parser_classes = [MultiPartParser, FormParser]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.interview_service = InterviewService()
    
    @action(detail=False, methods=['post'])
    def start(self, request):
        """Start a new interview"""
        try:
            application_id = request.data.get('application_id')
            result = self.interview_service.start_interview(application_id)
            return Response(result, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def next_question(self, request, pk=None):
        """Get next question for interview"""
        try:
            result = self.interview_service.get_next_question(pk)
            return Response(result, status=status.HTTP_200_OK)
        except Interview.DoesNotExist:
            return Response(
                {'error': 'Interview not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], url_path='answer/(?P<question_id>[^/.]+)')
    def submit_answer(self, request, pk=None, question_id=None):
        """Submit answer for a question"""
        try:
            answer_text = request.data.get('text', '')
            audio_file = request.FILES.get('audio')
            video_file = request.FILES.get('video')
            
            result = self.interview_service.submit_answer(
                pk, question_id, answer_text, audio_file, video_file
            )
            return Response(result, status=status.HTTP_200_OK)
        except (Interview.DoesNotExist, Question.DoesNotExist):
            return Response(
                {'error': 'Interview or question not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def stt(self, request):
        """Convert speech to text"""
        try:
            audio_file = request.FILES.get('audio')
            if not audio_file:
                return Response(
                    {'error': 'Audio file is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
                for chunk in audio_file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name
            
            # Convert to text
            text = self.interview_service.convert_speech_to_text(
                type('AudioFile', (), {'path': temp_file_path})()
            )
            
            # Cleanup
            os.unlink(temp_file_path)
            
            return Response({'text': text}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

