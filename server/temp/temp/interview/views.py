from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Interview, Question, Answer
from services.ai.questions import QuestionGenerator
from services.speech.client import SpeechService

class InterviewAPI(APIView):
    def post(self, request):
        """Start new interview"""
        job_id = request.data.get('job_id')
        candidate = request.user
        
        interview = Interview.objects.create(
            candidate=candidate,
            job_id=job_id,
            status='active'
        )
        
        # Create initial questions
        Question.objects.bulk_create([
            Question(
                interview=interview,
                text=text,
                order=i+1,
                generated=False
            ) for i, text in enumerate([
                "Tell me about yourself",
                "Why do you want this job?",
                "What interests you about our company?"
            ])
        ])
        
        return Response({
            'interview_id': interview.id,
            'questions': [q.text for q in interview.question_set.all()]
        }, status=status.HTTP_201_CREATED)

class AnswerAPI(APIView):
    def post(self, request, interview_id):
        """Process interview answer"""
        interview = Interview.objects.get(id=interview_id)
        current_question = interview.question_set.order_by('order').last()
        
        # Process speech data
        speech = SpeechService()
        audio_data = request.FILES['audio'].read()
        text = speech.speech_to_text(audio_data)
        
        # Save answer
        answer = Answer.objects.create(
            question=current_question,
            text=text,
            audio_path=...,  # Save to storage
            video_path=...,  # Save to storage
            content_score=0.0,
            voice_score=0.0,
            facial_score=0.0
        )
        
        # Generate next question
        if current_question.order < 12:
            generator = QuestionGenerator()
            next_question = generator.generate(
                job_desc=interview.job.description,
                previous_answer=text
            )
            
            Question.objects.create(
                interview=interview,
                text=next_question,
                order=current_question.order + 1,
                generated=True
            )
        
        return Response({'status': 'answer processed'})

class CompleteInterviewAPI(APIView):
    def post(self, request, interview_id):
        """Finalize interview results"""
        interview = Interview.objects.get(id=interview_id)
        answers = Answer.objects.filter(question__interview=interview)
        
        # Calculate scores
        interview.overall_score = sum(
            (a.content_score + a.voice_score + a.facial_score) / 3 
            for a in answers
        ) / len(answers)
        
        interview.status = 'completed'
        interview.save()
        
        return Response({
            'interview_id': interview.id,
            'final_score': interview.overall_score
        })