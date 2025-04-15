from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Interview, Question, Answer
from .serializers import InterviewSerializer
from .services.azure_client import AzureSpeechService
from .services.question_gen import QuestionGenerator
from .serializers import AnswerSerializer, QuestionSerializer

class InterviewViewSet(viewsets.ViewSet):
    def start_interview(self, request):
        serializer = InterviewSerializer(data=request.data)
        if serializer.is_valid():
            interview = serializer.save(user=request.user)
            # Create initial questions
            Question.objects.bulk_create([
                Question(interview=interview, text=text, order=i)
                for i, text in enumerate([
                    "Tell me about yourself",
                    "Why do you want to apply for this job?",
                    "What interests you most about our company?"
                ])
            ])
            return Response({'session_id': interview.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def list_questions(self, request, pk=None):
        try:
            interview = Interview.objects.get(id=pk, user=request.user)
        except Interview.DoesNotExist:
            return Response({'error': 'Invalid session.'}, status=400)
        questions = interview.questions.order_by('order')
        serializer = QuestionSerializer(questions, many=True)
        return Response({'questions': serializer.data})
    
    def submit_answer(self, request):
        interview_id = request.data.get('session_id')
        question_text = request.data.get('question')
        answer_text = request.data.get('answer')

        try:
            interview = Interview.objects.get(id=interview_id, user=request.user)
            question = interview.questions.get(text=question_text)
        except (Interview.DoesNotExist, Question.DoesNotExist):
            return Response({'error': 'Invalid session or question.'}, status=400)

        answer, created = Answer.objects.get_or_create(question=question)
        answer.text_response = answer_text
        answer.save()

        # Optionally, update interview progress
        interview.current_question += 1
        if interview.current_question >= 15:
            interview.completed = True
        interview.save()

        return Response({'success': True})
    

class VoiceConversionView(viewsets.ViewSet):
    def convert_voice(self, request):
        audio_file = request.FILES.get('audio')
        # Validate audio file
        if not audio_file.name.endswith('.wav'):
            return Response({'error': 'Invalid file format'}, status=400)
            
        text = AzureSpeechService().speech_to_text(audio_file)
        return Response({'text': text})

class QuestionGenerationView(viewsets.ViewSet):
    def generate_question(self, request):
        job_desc = request.data.get('jobDescription') or request.data.get('job_description')
        prev_answer = request.data.get('previousAnswer') or request.data.get('previous_answer')

        question_text = QuestionGenerator.generate(job_desc, prev_answer)
        audio_url = AzureSpeechService().text_to_speech(question_text)
        
        return Response({
            'question': question_text,
            'audio_url': audio_url
        })
