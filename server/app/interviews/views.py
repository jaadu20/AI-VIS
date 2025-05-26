# views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404
from django.core.files.base import ContentFile
from django.utils import timezone
import tempfile
import os
import logging

logger = logging.getLogger(__name__)

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
        
        # Get the application
        application = get_object_or_404(Application, id=application_id)
        
        # Create new interview
        interview = Interview.objects.create(application=application)
        
        # Generate intro audio
        intro_text = f"""
Welcome to your AI-powered interview for the {application.job_title} position at {application.company_name}. 
I'm your AI interviewer, and I'll be asking you 15 questions to assess your qualifications and fit for this role. 
Please speak clearly and take your time with each answer. Let's begin with your first question.
"""
        
        # Create intro audio file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
            success, audio_path = azure_speech.text_to_speech(intro_text, temp_audio.name)
            
            if success:
                # Save intro audio (you might want to implement file storage)
                pass
        
        # Generate first question (easy difficulty)
        first_question_text = question_generator.generate_question(
            application.job_description, 
            difficulty='easy'
        )
        
        # Create first question
        first_question = Question.objects.create(
            interview=interview,
            question_number=1,
            text=first_question_text,
            difficulty='easy'
        )
        
        # Generate audio for first question
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
            success, audio_path = azure_speech.text_to_speech(
                first_question_text, 
                temp_audio.name
            )
            
            if success:
                # Save question audio (implement file storage as needed)
                first_question.audio_url = f"/media/questions/{interview.id}_q1.wav"
                first_question.save()
        
        # Prepare response
        response_data = {
            'interview_id': str(interview.id),
            'intro_text': intro_text,
            'questions': [
                {
                    'text': first_question.text,
                    'difficulty': first_question.difficulty,
                    'question_number': first_question.question_number,
                    'audio_url': first_question.audio_url
                }
            ]
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Start interview error: {str(e)}")
        return Response(
            {'error': 'Failed to start interview'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_answer(request, interview_id):
    """Submit an answer and get the next question"""
    try:
        interview = get_object_or_404(Interview, id=interview_id)
        
        if interview.status != 'in_progress':
            return Response(
                {'error': 'Interview is not in progress'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get current question
        current_question = Question.objects.filter(
            interview=interview,
            question_number=interview.current_question_number
        ).first()
        
        if not current_question:
            return Response(
                {'error': 'Current question not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get answer text
        answer_text = request.data.get('text', '').strip()
        
        # Handle audio if provided
        if 'audio' in request.FILES:
            audio_file = request.FILES['audio']
            
            # Save audio temporarily for processing
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
                for chunk in audio_file.chunks():
                    temp_audio.write(chunk)
                temp_audio_path = temp_audio.name
            
            # Convert speech to text
            success, transcribed_text = azure_speech.speech_to_text(temp_audio_path)
            
            if success and transcribed_text.strip():
                # Use transcribed text if no manual text provided
                if not answer_text:
                    answer_text = transcribed_text.strip()
            
            # Clean up temp file
            os.unlink(temp_audio_path)
        
        if not answer_text:
            return Response(
                {'error': 'Answer text is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Score the answer
        score, feedback = answer_scorer.score_answer(
            current_question.text,
            answer_text,
            interview.application.job_description
        )
        
        # Save the answer
        Answer.objects.create(
            question=current_question,
            text=answer_text,
            score=score,
            feedback=feedback
        )
        
        # Update interview scores
        interview.total_score += score
        interview.average_score = interview.total_score / interview.current_question_number
        
        # Check if interview is complete
        if interview.current_question_number >= 15:
            interview.status = 'completed'
            interview.completed_at = timezone.now()
            interview.save()
            
            return Response({
                'completed': True,
                'final_score': interview.average_score,
                'total_questions': interview.current_question_number
            })
        
        # Generate next question based on performance
        # Determine difficulty for next question
        if interview.average_score >= 7.5:
            next_difficulty = 'hard'
        elif interview.average_score >= 5.0:
            next_difficulty = 'medium'
        else:
            next_difficulty = 'easy'
        
        # Generate next question
        next_question_text = question_generator.generate_question(
            interview.application.job_description,
            difficulty=next_difficulty
        )
        
        # Create next question
        interview.current_question_number += 1
        next_question = Question.objects.create(
            interview=interview,
            question_number=interview.current_question_number,
            text=next_question_text,
            difficulty=next_difficulty
        )
        
        # Generate audio for next question
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
            success, audio_path = azure_speech.text_to_speech(
                next_question_text,
                temp_audio.name
            )
            
            if success:
                next_question.audio_url = f"/media/questions/{interview.id}_q{next_question.question_number}.wav"
                next_question.save()
        
        interview.save()
        
        return Response({
            'completed': False,
            'question': {
                'text': next_question.text,
                'difficulty': next_question.difficulty,
                'question_number': next_question.question_number,
                'audio_url': next_question.audio_url
            },
            'current_score': score,
            'feedback': feedback,
            'average_score': interview.average_score
        })
        
    except Exception as e:
        logger.error(f"Submit answer error: {str(e)}")
        return Response(
            {'error': 'Failed to submit answer'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def text_to_speech(request):
    """Convert text to speech"""
    try:
        text = request.data.get('text')
        if not text:
            return Response(
                {'error': 'Text is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
            success, audio_path = azure_speech.text_to_speech(text, temp_audio.name)
            
            if success:
                response = FileResponse(
                    open(temp_audio.name, 'rb'),
                    content_type='audio/wav'
                )
                response['Content-Disposition'] = 'attachment; filename="speech.wav"'
                return response
            else:
                return Response(
                    {'error': 'Failed to generate speech'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
    except Exception as e:
        logger.error(f"TTS error: {str(e)}")
        return Response(
            {'error': 'Text-to-speech service failed'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def speech_to_text(request):
    """Convert speech to text"""
    try:
        if 'audio' not in request.FILES:
            return Response(
                {'error': 'Audio file is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        audio_file = request.FILES['audio']
        
        # Save audio temporarily
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
            for chunk in audio_file.chunks():
                temp_audio.write(chunk)
            temp_audio_path = temp_audio.name
        
        # Convert to text
        success, text = azure_speech.speech_to_text(temp_audio_path)
        
        # Clean up
        os.unlink(temp_audio_path)
        
        if success:
            return Response({'text': text})
        else:
            return Response(
                {'error': 'Failed to transcribe audio'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        logger.error(f"STT error: {str(e)}")
        return Response(
            {'error': 'Speech-to-text service failed'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interview_result(request, interview_id):
    """Get interview results"""
    try:
        interview = get_object_or_404(Interview, id=interview_id)
        
        questions_with_answers = []
        for question in interview.questions.all():
            question_data = {
                'question_number': question.question_number,
                'text': question.text,
                'difficulty': question.difficulty,
                'answer': None
            }
            
            if hasattr(question, 'answer'):
                question_data['answer'] = {
                    'text': question.answer.text,
                    'score': question.answer.score,
                    'feedback': question.answer.feedback
                }
            
            questions_with_answers.append(question_data)
        
        result_data = {
            'interview_id': str(interview.id),
            'status': interview.status,
            'total_score': interview.total_score,
            'average_score': interview.average_score,
            'total_questions': interview.current_question_number,
            'started_at': interview.started_at,
            'completed_at': interview.completed_at,
            'job_title': interview.application.job_title,
            'company_name': interview.application.company_name,
            'questions_and_answers': questions_with_answers
        }
        
        return Response(result_data)
        
    except Exception as e:
        logger.error(f"Get interview result error: {str(e)}")
        return Response(
            {'error': 'Failed to retrieve interview results'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
