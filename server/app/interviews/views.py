import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Interview, InterviewQuestion
from .utils.azure_speech import AzureSpeechService
from .utils.groq_scoring import GroqScoringService
from .utils.question_generator import QuestionGenerator
from interview_applications.models import Application

class StartInterviewView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, application_id):
        application = get_object_or_404(Application, id=application_id, user=request.user)
        
        # Create interview
        interview = Interview.objects.create(application=application)
        
        # Predefined introduction
        intro_text = (
            f"Welcome to your interview for {application.job.title} at {application.job.company_name}. "
            "I'll be your AI interviewer. Let's begin with some questions."
        )
        
        # Generate introduction audio
        speech_service = AzureSpeechService()
        intro_audio = speech_service.text_to_speech(intro_text)
        
        # Save to storage and get URL
        intro_audio_url = self._save_audio(interview, intro_audio, "introduction")
        
        return Response({
            'interview_id': str(interview.id),
            'intro_audio_url': intro_audio_url,
            'message': 'Interview started successfully'
        }, status=status.HTTP_201_CREATED)
    
    def _save_audio(self, interview, audio_bytes, prefix):
        # Implementation to save audio to storage (S3, local, etc.)
        # Returns URL to access the audio
        return f"/media/{interview.id}/{prefix}.wav"

class NextQuestionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, interview_id):
        interview = get_object_or_404(Interview, id=interview_id, application__user=request.user)
        
        # First two questions are predefined
        predefined_questions = [
            "Tell me about your relevant experience for this role.",
            "Why are you interested in this position and our company?"
        ]
        
        if interview.current_question < 2:
            # Predefined questions
            question_text = predefined_questions[interview.current_question]
            difficulty = 'easy'
        elif interview.current_question == 2:
            # Third question generated from job description
            generator = QuestionGenerator()
            question_text = generator.generate_question(
                interview.application.job.description,
                difficulty='easy'
            )
            difficulty = 'easy'
        else:
            # Subsequent questions based on previous performance
            prev_score = self._get_previous_score(interview)
            
            if prev_score < 4:
                difficulty = 'easy'
            elif prev_score < 7:
                difficulty = 'medium'
            else:
                difficulty = 'hard'
            
            generator = QuestionGenerator()
            question_text = generator.generate_question(
                interview.application.job.description,
                difficulty=difficulty
            )
        
        # Create question record
        question = InterviewQuestion.objects.create(
            interview=interview,
            question_text=question_text,
            difficulty=difficulty,
            sequence=interview.current_question + 1
        )
        
        # Generate audio
        speech_service = AzureSpeechService()
        question_audio = speech_service.text_to_speech(question_text)
        audio_url = self._save_audio(interview, question_audio, f"q{question.sequence}")
        
        # Update interview
        interview.current_question += 1
        interview.save()
        
        return Response({
            'question_id': str(question.id),
            'question_text': question_text,
            'question_audio_url': audio_url,
            'sequence': question.sequence
        })
    
    def _get_previous_score(self, interview):
        # Get score from previous question
        prev_question = InterviewQuestion.objects.filter(
            interview=interview,
            sequence=interview.current_question
        ).first()
        return prev_question.score if prev_question else 5

class SubmitAnswerView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, interview_id, question_id):
        interview = get_object_or_404(Interview, id=interview_id, application__user=request.user)
        question = get_object_or_404(InterviewQuestion, id=question_id, interview=interview)
        
        # Get audio file from request
        audio_file = request.FILES.get('audio')
        if not audio_file:
            return Response({'error': 'Audio file required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save audio to question
        question.answer_audio = audio_file
        question.save()
        
        # Convert speech to text
        speech_service = AzureSpeechService()
        answer_text = speech_service.speech_to_text(audio_file)
        question.answer_text = answer_text
        question.save()
        
        # Score answer using Groq
        scoring_service = GroqScoringService()
        score = scoring_service.score_answer(question.question_text, answer_text)
        question.score = score
        question.save()
        
        # Check if interview is complete
        if interview.current_question >= 15:  # Assuming 15 questions
            interview.status = 'completed'
            interview.save()
            return Response({
                'status': 'completed',
                'message': 'Interview completed successfully'
            })
        
        return Response({
            'score': score,
            'next_question_url': f'/interviews/{interview_id}/next-question/'
        })