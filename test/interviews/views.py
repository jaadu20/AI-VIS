# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Application, Interview, InterviewQuestion
from .services.llm_service import LLMService
from .services.speech_service import SpeechService
from .services.scoring_service import ScoringService
import json

# Initialize services
llm_service = LLMService()
speech_service = SpeechService()
scoring_service = ScoringService()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_interview(request):
    """Start a new interview session"""
    try:
        application_id = request.data.get('application_id')
        
        if not application_id:
            return Response(
                {'error': 'Application ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get application
        application = get_object_or_404(Application, id=application_id)
        
        # Create interview instance
        interview = Interview.objects.create(
            application=application,
            current_question_index=0
        )
        
        # Generate first question (easy level)
        first_question_text = llm_service.generate_question(
            application.job_description, 
            difficulty="easy"
        )
        
        # Create first question
        first_question = InterviewQuestion.objects.create(
            interview=interview,
            question_text=first_question_text,
            difficulty="easy",
            question_order=1
        )
        
        # Prepare response
        questions = [
            {
                "text": first_question_text,
                "difficulty": "easy"
            }
        ]
        
        return Response({
            'interview_id': str(interview.id),
            'questions': questions,
            'intro_text': f"Welcome to your interview for the {application.job_title} position at {application.company_name}. I'll be asking you 15 questions to assess your skills and experience. Let's begin with the first question."
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def text_to_speech(request):
    """Convert text to speech"""
    try:
        text = request.data.get('text', '')
        
        if not text:
            return Response(
                {'error': 'Text is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate speech
        audio_data = speech_service.text_to_speech(text)
        
        # Return audio file
        response = HttpResponse(audio_data, content_type='audio/mpeg')
        response['Content-Disposition'] = 'attachment; filename="speech.mp3"'
        return response
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def speech_to_text(request):
    """Convert speech to text"""
    try:
        audio_file = request.FILES.get('audio')
        
        if not audio_file:
            return Response(
                {'error': 'Audio file is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Convert speech to text
        transcribed_text = speech_service.speech_to_text(audio_file)
        
        return Response({'text': transcribed_text})
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_answer(request, interview_id):
    """Submit answer and get next question"""
    try:
        interview = get_object_or_404(Interview, id=interview_id)
        
        if interview.is_completed:
            return Response(
                {'error': 'Interview already completed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        answer_text = request.data.get('text', '')
        
        if not answer_text.strip():
            return Response(
                {'error': 'Answer text is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get current question
        current_question = interview.questions.filter(
            question_order=interview.current_question_index + 1
        ).first()
        
        if not current_question:
            return Response(
                {'error': 'Current question not found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save answer and score it
        current_question.answer_text = answer_text
        current_question.answered_at = timezone.now()
        
        # Score the answer
        score = scoring_service.score_answer(
            current_question.question_text,
            answer_text,
            current_question.difficulty
        )
        current_question.score = score
        current_question.save()
        
        # Update interview progress
        interview.current_question_index += 1
        interview.total_score += score
        
        # Check if interview is complete (15 questions)
        if interview.current_question_index >= 15:
            interview.is_completed = True
            interview.completed_at = timezone.now()
            interview.save()
            
            return Response({
                'completed': True,
                'final_score': interview.total_score,
                'average_score': interview.total_score / 15
            })
        
        # Generate next question based on current score
        next_difficulty = scoring_service.determine_next_difficulty(score)
        next_question_text = llm_service.generate_question(
            interview.application.job_description,
            difficulty=next_difficulty
        )
        
        # Create next question
        next_question = InterviewQuestion.objects.create(
            interview=interview,
            question_text=next_question_text,
            difficulty=next_difficulty,
            question_order=interview.current_question_index + 1
        )
        
        interview.save()
        
        return Response({
            'completed': False,
            'score': score,
            'question': {
                'text': next_question_text,
                'difficulty': next_difficulty
            },
            'progress': {
                'current_question': interview.current_question_index + 1,
                'total_questions': 15,
                'current_score': interview.total_score
            }
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interview_result(request, interview_id):
    """Get interview results"""
    try:
        interview = get_object_or_404(Interview, id=interview_id)
        
        if not interview.is_completed:
            return Response(
                {'error': 'Interview not completed yet'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all questions and answers
        questions_data = []
        for question in interview.questions.all():
            questions_data.append({
                'question': question.question_text,
                'answer': question.answer_text,
                'difficulty': question.difficulty,
                'score': question.score,
                'order': question.question_order
            })
        
        return Response({
            'interview_id': str(interview.id),
            'job_title': interview.application.job_title,
            'company_name': interview.application.company_name,
            'total_score': interview.total_score,
            'average_score': interview.total_score / len(questions_data),
            'duration': (interview.completed_at - interview.started_at).total_seconds() / 60,  # in minutes
            'questions': questions_data,
            'completed_at': interview.completed_at
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )