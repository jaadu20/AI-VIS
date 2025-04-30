# interviews/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, JSONParser
from .models import Interview, Question, Answer
from .services import AzureSpeechService, InterviewManager
from job_applications.models import Application

class StartInterviewView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        try:
            application = Application.objects.get(
                id=request.data.get('application_id'),
                applicant=request.user
            )
            interview = Interview.objects.create(application=application)
            manager = InterviewManager(interview)
            
            # Create initial questions
            questions = manager.generate_initial_questions()
            Question.objects.bulk_create([
                Question(
                    interview=interview,
                    **question
                ) for question in questions
            ])
            
            return Response({
                'interview_id': str(interview.id),
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
            interview = Interview.objects.get(id=interview_id)
            if interview.completed:
                return Response({'error': 'Interview completed'}, status=status.HTTP_400_BAD_REQUEST)
                
            current_question = interview.questions.get(order=interview.current_question)
            answer_text = request.data.get('text', '')
            
            # Process audio if provided
            if 'audio' in request.FILES:
                audio_file = request.FILES['audio'].read()
                try:
                    answer_text = AzureSpeechService().speech_to_text(audio_file)
                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            # Save answer
            answer = Answer.objects.create(
                question=current_question,
                text=answer_text,
                audio=request.FILES.get('audio')
            )
            
            # Analyze answer and generate next question
            manager = InterviewManager(interview)
            analysis = manager.analyze_answer(current_question, answer_text)
            
            if interview.current_question < 14:
                next_question = manager.generate_next_question()
                Question.objects.create(
                    interview=interview,
                    text=next_question['question'],
                    order=interview.current_question + 1,
                    difficulty=next_question['difficulty']
                )
                interview.current_question += 1
                interview.save()
                
                return Response({
                    'current_question': interview.current_question,
                    'question': next_question['question'],
                    'difficulty': next_question['difficulty'],
                    'feedback': analysis['feedback']
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

class TextToSpeechView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        text = request.data.get('text')
        if not text:
            return Response({'error': 'Text required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            audio_data = AzureSpeechService().text_to_speech(text)
            return Response(audio_data, content_type='audio/wav')
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SpeechToTextView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    
    def post(self, request):
        if 'audio' not in request.FILES:
            return Response({'error': 'Audio file required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            text = AzureSpeechService().speech_to_text(request.FILES['audio'].read())
            return Response({'text': text})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)