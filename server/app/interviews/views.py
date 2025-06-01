# interviews/views.py
import os
import json
import requests
import azure.cognitiveservices.speech as speechsdk
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Interview, Question, Answer
from .serializers import InterviewSerializer, QuestionSerializer, AnswerSerializer
from interview_applications.models import Application

# Azure Speech Service Integration
# class SpeechService:
#     def __init__(self):
#         self.speech_config = speechsdk.SpeechConfig(
#             subscription=os.environ.get('AZURE_SPEECH_KEY'),
#             region=os.environ.get('AZURE_SPEECH_REGION')
#         )
#         self.speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
    
#     def text_to_speech(self, text):
#         synthesizer = speechsdk.SpeechSynthesizer(speech_config=self.speech_config)
#         result = synthesizer.speak_text_async(text).get()
        
#         if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
#             return result.audio_data
#         elif result.reason == speechsdk.ResultReason.Canceled:
#             cancellation = result.cancellation_details
#             error_msg = f"Speech synthesis canceled: {cancellation.reason}"
#             if cancellation.reason == speechsdk.CancellationReason.Error:
#                 if cancellation.ErrorCode:
#                     error_msg += f", ErrorCode={cancellation.ErrorCode}"
#                 if cancellation.ErrorDetails:
#                     error_msg += f", ErrorDetails={cancellation.ErrorDetails}"
#             raise Exception(error_msg)
#         return None
    
#     def speech_to_text(self, audio_data):
#         audio_stream = speechsdk.AudioInputStream(audio_data)
#         audio_config = speechsdk.audio.AudioConfig(stream=audio_stream)
#         recognizer = speechsdk.SpeechRecognizer(speech_config=self.speech_config, audio_config=audio_config)
        
#         result = recognizer.recognize_once_async().get()
#         if result.reason == speechsdk.ResultReason.RecognizedSpeech:
#             return result.text
#         elif result.reason == speechsdk.ResultReason.NoMatch:
#             raise Exception("No speech could be recognized")
#         elif result.reason == speechsdk.ResultReason.Canceled:
#             cancellation = result.cancellation_details
#             error_msg = f"Speech recognition canceled: {cancellation.reason}"
#             if cancellation.reason == speechsdk.CancellationReason.Error:
#                 error_msg += f"\nError details: {cancellation.error_details}"
#             raise Exception(error_msg)

# Groq API Integration
class GroqScorer:
    def __init__(self):
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
    
    def score_answer(self, question, answer):
        prompt = f"""
        You are an expert interviewer evaluating a candidate's response to an interview question.
        Score the following answer on a scale of 0-10, where:
        0 = Completely irrelevant or no answer
        5 = Partially relevant but incomplete
        10 = Excellent, comprehensive response
        
        Question: {question}
        Answer: {answer}
        
        Provide your response in JSON format with the following structure:
        {{
            "score": <number>,
            "reason": "<brief explanation>"
        }}
        """
        
        payload = {
            "model": "llama3-70b-8192",
            "messages": [
                {"role": "system", "content": "You are an expert interviewer scoring candidate responses."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"}
        }
        
        try:
            response = requests.post(self.api_url, headers=self.headers, json=payload)
            response.raise_for_status()
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            return json.loads(content)
        except Exception as e:
            return {"error": str(e)}

# Hugging Face Question Generator
class QuestionGenerator:
    def __init__(self):
        self.api_url = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct"
        self.headers = {
            "Authorization": f"Bearer {settings.HF_TOKEN}",
            "Content-Type": "application/json"
        }
    
    def generate_question(self, job_description, difficulty, previous_questions):
        prompt = f"""
        <|begin_of_text|>
        <|start_header_id|>system<|end_header_id|>
        You are a professional interviewer generating questions for a job application.
        The job description is: {job_description[:1000]}
        Generate a {difficulty}-difficulty interview question.
        Make sure the question hasn't been asked before in: {', '.join(previous_questions[:3])}
        Return ONLY the question text with no additional commentary.<|eot_id|>
        <|start_header_id|>assistant<|end_header_id|>
        """
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 100,
                "temperature": 0.7,
                "top_p": 0.9,
                "do_sample": True,
                "return_full_text": False
            }
        }
        
        try:
            response = requests.post(self.api_url, headers=self.headers, json=payload)
            response.raise_for_status()
            result = response.json()
            return result[0]['generated_text'].strip()
        except Exception as e:
            return f"Failed to generate question: {str(e)}"

# Audio/Video Analysis Service (Mock)
class MediaAnalyzer:
    def analyze_audio(self, audio_data):
        # In a real implementation, this would use a pre-trained model
        # For now, we'll return a mock score based on answer length
        return min(10, len(audio_data) / 1000)  # 1 point per second of speech
    
    def analyze_video(self, video_frame):
        # In a real implementation, this would analyze facial expressions, eye contact, etc.
        # For now, return a fixed score
        return 7.5

class InterviewViewSet(viewsets.ModelViewSet):
    queryset = Interview.objects.all()
    serializer_class = InterviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Interview.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def start(self, request):
        application_id = request.data.get('application_id')
        try:
            application = Application.objects.get(id=application_id, user=request.user)
        except Application.DoesNotExist:
            return Response(
                {"error": "Application not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create interview
        interview = Interview.objects.create(
            user=request.user,
            application=application,
            status='in_progress'
        )
        
        # Add predefined questions
        Question.objects.create(
            interview=interview,
            text="Please introduce yourself and tell us about your background and experience.",
            difficulty="easy",
            is_predefined=True,
            order=0
        )
        Question.objects.create(
            interview=interview,
            text="What interests you most about this position and our company?",
            difficulty="easy",
            is_predefined=True,
            order=1
        )
        
        return Response({
            "interview_id": str(interview.id),
            "questions": QuestionSerializer(interview.questions.all(), many=True).data
        }, status=status.HTTP_201_CREATED)
        

class TextToSpeechView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # Require authentication

    def post(self, request):
        text = request.data.get('text')
        if not text:
            return Response({'error': 'Text is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Initialize Azure Speech Service
            speech_config = speechsdk.SpeechConfig(
                subscription=settings.AZURE_SPEECH_KEY,
                region=settings.AZURE_SPEECH_REGION
            )
            speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
            
            # Create synthesizer with in-memory output
            audio_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=False)
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=speech_config, 
                audio_config=audio_config
            )
            
            # Synthesize text to audio
            result = synthesizer.speak_text_async(text).get()
            
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                # Get audio data as bytes
                audio_data = result.audio_data
                return HttpResponse(audio_data, content_type='audio/mpeg')
                
            elif result.reason == speechsdk.ResultReason.Canceled:
                cancellation = result.cancellation_details
                error_msg = f"Speech synthesis canceled: {cancellation.reason}"
                if cancellation.reason == speechsdk.CancellationReason.Error:
                    error_msg += f"\nError details: {cancellation.error_details}"
                return Response({'error': error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({'error': 'Speech synthesis failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class SpeechToTextView(APIView):
    # permission_classes = []  # Adjust permissions as needed

    def post(self, request):
        try:
            audio_file = request.FILES.get('audio')
            if not audio_file:
                return Response({"error": "Audio file is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Initialize Azure Speech Service
            speech_config = speechsdk.SpeechConfig(
                subscription=settings.AZURE_SPEECH_KEY,
                region=settings.AZURE_SPEECH_REGION
            )
            
            # Configure audio input
            audio_stream = speechsdk.audio.PushAudioInputStream()
            audio_config = speechsdk.audio.AudioConfig(stream=audio_stream)
            recognizer = speechsdk.SpeechRecognizer(
                speech_config=speech_config, 
                audio_config=audio_config
            )
            
            # Write audio data to stream
            audio_data = audio_file.read()
            audio_stream.write(audio_data)
            audio_stream.close()
            
            # Recognize speech
            result = recognizer.recognize_once_async().get()
            
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                return Response({"text": result.text})
                
            elif result.reason == speechsdk.ResultReason.NoMatch:
                return Response({"error": "No speech could be recognized"}, status=status.HTTP_400_BAD_REQUEST)
                
            elif result.reason == speechsdk.ResultReason.Canceled:
                cancellation = result.cancellation_details
                error_msg = f"Speech recognition canceled: {cancellation.reason}"
                if cancellation.reason == speechsdk.CancellationReason.Error:
                    error_msg += f"\nError details: {cancellation.error_details}"
                return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SubmitAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            data = request.POST
            files = request.FILES
            
            interview_id = data.get('interview_id')
            question_id = data.get('question_id')
            answer_text = data.get('answer_text')
            audio_file = files.get('answer_audio')
            video_frame = files.get('video_frame')
            
            if not interview_id or not question_id:
                return Response({"error": "Interview ID and Question ID are required"}, status=400)
            
            try:
                interview = Interview.objects.get(id=interview_id, user=request.user)
                question = Question.objects.get(id=question_id, interview=interview)
            except (Interview.DoesNotExist, Question.DoesNotExist):
                return Response({"error": "Interview or Question not found"}, status=404)
            
            # Save answer
            answer = Answer.objects.create(
                question=question,
                text=answer_text
            )
            
            if audio_file:
                answer.audio.save(audio_file.name, audio_file)
            
            if video_frame:
                answer.video_frame.save(video_frame.name, video_frame)
            
            # Score the answer using Groq API
            scorer = GroqScorer()
            scoring_result = scorer.score_answer(question.text, answer_text)
            
            if 'score' in scoring_result:
                answer.score = scoring_result['score']
                answer.feedback = scoring_result.get('reason', '')
                
                # Analyze media (mock implementation)
                analyzer = MediaAnalyzer()
                if audio_file:
                    answer.audio_score = analyzer.analyze_audio(audio_file.read())
                if video_frame:
                    answer.video_score = analyzer.analyze_video(video_frame.read())
                
                answer.save()
                
                # Update interview score
                interview.total_score = (interview.total_score or 0) + scoring_result['score']
                interview.save()
                
                # Generate next question if needed
                if question.order < 14:  # Total 15 questions
                    next_question = self.generate_next_question(
                        interview, 
                        scoring_result['score']
                    )
                    return Response({
                        "score": scoring_result['score'],
                        "reason": scoring_result.get('reason', ''),
                        "next_question": next_question
                    })
                else:
                    interview.status = 'completed'
                    interview.save()
                    return Response({
                        "score": scoring_result['score'],
                        "reason": scoring_result.get('reason', ''),
                        "completed": True
                    })
            else:
                return Response({"error": scoring_result.get('error', 'Scoring failed')}, status=500)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
    
    def generate_next_question(self, interview, previous_score):
        # Determine difficulty based on score
        if previous_score >= 8:
            difficulty = "hard"
        elif previous_score >= 5:
            difficulty = "medium"
        else:
            difficulty = "easy"
        
        # Get previous questions to avoid repetition
        previous_questions = list(interview.questions.values_list('text', flat=True))
        
        # Generate new question
        generator = QuestionGenerator()
        job_description = interview.application.job_description
        question_text = generator.generate_question(
            job_description, 
            difficulty, 
            previous_questions
        )
        
        # Create new question
        order = interview.questions.count()
        question = Question.objects.create(
            interview=interview,
            text=question_text,
            difficulty=difficulty,
            order=order
        )
        
        return {
            "id": question.id,
            "text": question.text,
            "difficulty": question.difficulty,
            "order": question.order
        }

class InterviewResultView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, interview_id):
        try:
            interview = Interview.objects.get(id=interview_id, user=request.user)
            answers = Answer.objects.filter(question__interview=interview).select_related('question')
            
            result = {
                "total_score": interview.total_score,
                "questions": []
            }
            
            for answer in answers:
                result["questions"].append({
                    "question": answer.question.text,
                    "answer": answer.text,
                    "score": answer.score,
                    "audio_score": answer.audio_score,
                    "video_score": answer.video_score,
                    "feedback": answer.feedback
                })
            
            return Response(result)
        except Interview.DoesNotExist:
            return Response({"error": "Interview not found"}, status=404)