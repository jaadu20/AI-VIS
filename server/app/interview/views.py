# interviews/views.py (updated)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, JSONParser
import uuid
from .models import Interview, Question, Answer
from .services import GroqQuestionGenerator, AzureSpeechService
from jobs.models import JobPosting
from django.core.files.base import ContentFile

class StartInterviewView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        job_id = request.data.get('job_id')
        if not job_id:
            return Response({'error': 'Missing job_id'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = JobPosting.objects.get(id=job_id)
            interview = Interview.objects.create(
                user=request.user,
                job_posting=job,
                interview_id=uuid.uuid4(),
                difficulty=request.data.get('difficulty', 'medium')
            )

            # Create initial questions
            predefined = [
                {"text": "Tell me about yourself", "difficulty": "easy"},
                {"text": "Why are you interested in this position?", "difficulty": "easy"}
            ]
            
            for idx, q in enumerate(predefined):
                Question.objects.create(
                    interview=interview,
                    **q,
                    order=idx,
                    is_predefined=True
                )

            return Response({
                'interview_id': interview.interview_id,
                'current_question': 0,
                'questions': [q.text for q in interview.questions.all()],
                'difficulty': interview.difficulty
            }, status=status.HTTP_201_CREATED)

        except JobPosting.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

class SubmitAnswerView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, JSONParser]

    def post(self, request, interview_id):
        try:
            interview = Interview.objects.get(interview_id=interview_id, user=request.user)
            if interview.completed:
                return Response({'error': 'Interview completed'}, status=status.HTTP_400_BAD_REQUEST)

            current_question = interview.questions.get(order=interview.current_question)
            answer_data = {
                'text': request.data.get('answer', ''),
                'analysis': {}
            }

            # Handle audio/video files
            if 'audio' in request.FILES:
                audio_file = request.FILES['audio']
                answer_data['audio'] = ContentFile(audio_file.read(), name=f"audio_q{interview.current_question}.webm")
                
            if 'video' in request.FILES:
                video_file = request.FILES['video']
                answer_data['video'] = ContentFile(video_file.read(), name=f"video_q{interview.current_question}.webm")

            Answer.objects.update_or_create(
                question=current_question,
                defaults=answer_data
            )

            # Generate next question if needed
            if 2 <= interview.current_question < 14:
                generator = GroqQuestionGenerator()
                prev_answers = list(interview.questions.filter(order__lt=interview.current_question))
                previous_data = [{
                    'text': q.text,
                    'answer': q.answer.text if hasattr(q, 'answer') else '',
                    'difficulty': q.difficulty
                } for q in prev_answers]

                new_q = generator.generate_question(
                    context=interview.job_posting.description,
                    previous_answers=previous_data,
                    difficulty=interview.difficulty
                )
                
                Question.objects.create(
                    interview=interview,
                    text=new_q['text'],
                    difficulty=new_q['difficulty'],
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
                'next_question': interview.questions.get(order=interview.current_question).text if not interview.completed else None
            })

        except Interview.DoesNotExist:
            return Response({'error': 'Interview not found'}, status=status.HTTP_404_NOT_FOUND)

class AzureTTSView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        text = request.data.get('text')
        if not text:
            return Response({'error': 'Missing text'}, status=400)
        
        speech_service = AzureSpeechService()
        audio_data = speech_service.text_to_speech(text)
        
        if audio_data:
            return Response(audio_data, content_type='audio/wav')
        return Response({'error': 'TTS failed'}, status=500)

class AzureSTTView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        if 'audio' not in request.FILES:
            return Response({'error': 'No audio file'}, status=400)
        
        speech_service = AzureSpeechService()
        audio_file = request.FILES['audio']
        text = speech_service.speech_to_text(audio_file.read())
        
        if text:
            return Response({'text': text})
        return Response({'error': 'STT failed'}, status=500)