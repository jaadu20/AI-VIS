from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Interview
from .services import GrokAIService
from jobs.models import Job
import uuid
from django.http import JsonResponse
from django.views import View
from azure.cognitiveservices.speech import SpeechConfig, SpeechSynthesizer, SpeechRecognizer
import azure.cognitiveservices.speech as speechsdk
import tempfile
import os


class GenerateQuestionView(APIView):
    def post(self, request):
        user = request.user
        job_id = request.data.get('job_id')
        previous_answer = request.data.get('previous_answer', '')
        
        try:
            job = Job.objects.get(id=job_id)
            interview, created = Interview.objects.get_or_create(
                user=user,
                job_posting=job,
                completed=False
            )
            
            if created or len(interview.questions) == 0:
                # First two predefined questions
                questions = [
                    "Tell me about yourself",
                    "Why are you applying for this position at our company?"
                ]
                interview.questions = questions
                interview.save()
                return Response({'question': questions[0]})
            
            current_index = len(interview.answers)
            if current_index < 2:
                return Response({'question': interview.questions[current_index]})
            
            # Generate new question based on difficulty
            analysis = GrokAIService.analyze_answer(
                interview.questions[-1],
                previous_answer,
                job.description
            )
            
            # Update difficulty based on analysis
            score = analysis.get('score', 50)
            if score > 70:
                new_difficulty = 'hard'
            elif score > 40:
                new_difficulty = 'medium'
            else:
                new_difficulty = 'easy'
                
            interview.difficulty_level = new_difficulty
            new_question = GrokAIService.generate_question(
                job.description,
                previous_answer,
                new_difficulty
            )
            
            interview.questions.append(new_question)
            interview.save()
            
            return Response({'question': new_question})
        
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

class SubmitAnswerView(APIView):
    def post(self, request):
        user = request.user
        interview_id = request.data.get('interview_id')
        answer = request.data.get('answer')
        
        try:
            interview = Interview.objects.get(id=interview_id, user=user)
            current_index = len(interview.answers)
            
            if current_index >= 15:
                return Response({'error': 'Interview completed'}, status=400)
            
            # Analyze answer
            analysis = GrokAIService.analyze_answer(
                interview.questions[current_index],
                answer,
                interview.job_posting.description
            )
            
            # Store answer and analysis
            interview.answers.append({
                'text': answer,
                'analysis': analysis,
                'difficulty': interview.difficulty_level
            })
            
            if current_index == 14:
                interview.completed = True
                
            interview.save()
            
            return Response({
                'analysis': analysis,
                'next_question': interview.questions[current_index + 1] if current_index < 14 else None
            })
        
        except Interview.DoesNotExist:
            return Response({'error': 'Interview not found'}, status=404)
        
# azure view --------------------------------------------------------------------

class TextToSpeechView(View):
    def post(self, request):
        text = request.POST.get('text', '')
        
        speech_config = SpeechConfig(
            subscription=os.environ.get('AZURE_SPEECH_KEY'),
            region=os.environ.get('AZURE_SPEECH_REGION')
        )
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as f:
            synthesizer = SpeechSynthesizer(speech_config, audio_config=speechsdk.AudioConfig(filename=f.name))
            result = synthesizer.speak_text(text)
            
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                return JsonResponse({'audio_url': f.name})
            
        return JsonResponse({'error': 'TTS failed'}, status=500)

class SpeechToTextView(View):
    def post(self, request):
        audio_file = request.FILES.get('audio')
        
        speech_config = SpeechConfig(
            subscription=os.environ.get('AZURE_SPEECH_KEY'),
            region=os.environ.get('AZURE_SPEECH_REGION')
        )
        
        with tempfile.NamedTemporaryFile(delete=False) as f:
            for chunk in audio_file.chunks():
                f.write(chunk)
                
            audio_input = speechsdk.AudioConfig(filename=f.name)
            recognizer = speechsdk.SpeechRecognizer(speech_config, audio_input)
            
            result = recognizer.recognize_once()
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                return JsonResponse({'text': result.text})
            
        return JsonResponse({'error': 'STT failed'}, status=500)