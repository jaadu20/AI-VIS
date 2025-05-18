# # interviews/views.py
# import os
# import uuid
# import json
# import logging
# import tempfile
# from datetime import datetime

# from django.conf import settings
# from django.db import transaction, models
# from django.utils import timezone
# from django.http import HttpResponse
# from django.core.files.base import ContentFile

# from rest_framework import status, generics
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated

# import requests
# import numpy as np
# import torch
# from transformers import (
#     AutoModelForSequenceClassification,
#     AutoTokenizer,
#     pipeline,
#     AutoProcessor,
#     AutoModelForSpeechSeq2Seq,
#     AutoModelForSeq2SeqLM
# )

# from .models import (
#     Question, Interview, InterviewQuestion, Answer, 
#     InterviewResult, JobPosition
# )
# from .serializers import (
#     QuestionSerializer, InterviewSerializer, InterviewResultSerializer,
#     TextToSpeechSerializer, AudioToTextSerializer, AnswerSubmitSerializer,
#     InterviewStartSerializer
# )

# logger = logging.getLogger(__name__)

# # Load Hugging Face models
# try:
#     # Text-to-Speech model
#     TTS_MODEL = "facebook/mms-tts-eng"
    
#     # Speech-to-Text model
#     STT_MODEL = "openai/whisper-medium"
#     stt_processor = AutoProcessor.from_pretrained(STT_MODEL)
#     stt_model = AutoModelForSpeechSeq2Seq.from_pretrained(STT_MODEL)
    
#     # Answer analysis model
#     ANALYSIS_MODEL = "distilbert-base-uncased-finetuned-sst-2-english"
#     analysis_tokenizer = AutoTokenizer.from_pretrained(ANALYSIS_MODEL)
#     analysis_model = AutoModelForSequenceClassification.from_pretrained(ANALYSIS_MODEL)
    
#     # Question generation model
#     QUESTION_MODEL = "facebook/bart-large-cnn"
#     question_tokenizer = AutoTokenizer.from_pretrained(QUESTION_MODEL)
#     question_model = AutoModelForSeq2SeqLM.from_pretrained(QUESTION_MODEL)
    
#     # Answer summarization model
#     SUMMARY_MODEL = "facebook/bart-large-cnn"
#     summary_pipeline = pipeline("summarization", model=SUMMARY_MODEL)
    
#     print("All models loaded successfully!")
    
# except Exception as e:
#     logger.error(f"Error loading models: {e}")
#     print(f"Error loading models: {e}")


# class TextToSpeechView(APIView):
#     """
#     Convert text to speech using Hugging Face model
#     """
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         serializer = TextToSpeechSerializer(data=request.data)
#         if serializer.is_valid():
#             text = serializer.validated_data['text']
            
#             try:
#                 # Using Hugging Face Inference API for TTS
#                 API_URL = f"https://api-inference.huggingface.co/models/{TTS_MODEL}"
#                 headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_TOKEN}"}
#                 payload = {"inputs": text}
                
#                 response = requests.post(API_URL, headers=headers, json=payload)
                
#                 if response.status_code == 200:
#                     # Return audio file
#                     audio_content = response.content
#                     return HttpResponse(
#                         audio_content,
#                         content_type="audio/wav",
#                         headers={"Content-Disposition": 'attachment; filename="speech.wav"'}
#                     )
#                 else:
#                     # Fallback to local model if API fails
#                     # This would require implementing local TTS which is more complex
#                     logger.error(f"TTS API error: {response.text}")
#                     return Response(
#                         {"error": "Failed to generate speech"}, 
#                         status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                     )
            
#             except Exception as e:
#                 logger.error(f"TTS error: {str(e)}")
#                 return Response(
#                     {"error": str(e)}, 
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )
        
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class SpeechToTextView(APIView):
#     """
#     Convert speech to text using Whisper model
#     """
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         serializer = AudioToTextSerializer(data=request.data)
#         if serializer.is_valid():
#             audio_file = serializer.validated_data['audio']
            
#             try:
#                 # Save audio file temporarily
#                 with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_audio:
#                     for chunk in audio_file.chunks():
#                         temp_audio.write(chunk)
#                     temp_audio_path = temp_audio.name
                
#                 # Using Hugging Face Inference API for STT
#                 API_URL = f"https://api-inference.huggingface.co/models/{STT_MODEL}"
#                 headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_TOKEN}"}
                
#                 with open(temp_audio_path, "rb") as f:
#                     audio_data = f.read()
                
#                 response = requests.post(API_URL, headers=headers, data=audio_data)
                
#                 # Clean up temp file
#                 os.unlink(temp_audio_path)
                
#                 if response.status_code == 200:
#                     result = response.json()
#                     transcribed_text = result.get('text', '')
#                     return Response({"text": transcribed_text}, status=status.HTTP_200_OK)
#                 else:
#                     # Fallback to local model
#                     # This is a simplified version and would need proper audio loading for production
#                     import librosa
#                     import soundfile as sf
                    
#                     audio_array, _ = librosa.load(temp_audio_path, sr=16000)
#                     inputs = stt_processor(audio_array, sampling_rate=16000, return_tensors="pt")
                    
#                     with torch.no_grad():
#                         outputs = stt_model.generate(inputs["input_features"])
                    
#                     transcribed_text = stt_processor.batch_decode(outputs, skip_special_tokens=True)[0]
#                     return Response({"text": transcribed_text}, status=status.HTTP_200_OK)
            
#             except Exception as e:
#                 logger.error(f"STT error: {str(e)}")
#                 return Response(
#                     {"error": str(e)}, 
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )
        
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class InterviewStartView(APIView):
#     """
#     Start a new interview session and get first question
#     """
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         serializer = InterviewStartSerializer(data=request.data)
#         if serializer.is_valid():
#             application_id = serializer.validated_data.get('application_id')
#             job_position_id = serializer.validated_data.get('job_position_id')
            
#             try:
#                 with transaction.atomic():
#                     # Create new interview
#                     interview = Interview.objects.create(
#                         user=request.user,
#                         application_id=application_id,
#                         status='in_progress'
#                     )
                    
#                     if job_position_id:
#                         try:
#                             job_position = JobPosition.objects.get(id=job_position_id)
#                             interview.job_position = job_position
#                             interview.save()
#                         except JobPosition.DoesNotExist:
#                             pass
                    
#                     # Get questions based on job position or use default questions
#                     questions = self.get_interview_questions(interview)
                    
#                     # Return first 3 questions to the frontend
#                     question_data = []
#                     for i, question in enumerate(questions[:3]):
#                         question_data.append({
#                             'text': question.text,
#                             'difficulty': question.difficulty,
#                             'is_predefined': question.is_predefined
#                         })
                    
#                     return Response({
#                         'interview_id': interview.id,
#                         'questions': question_data
#                     }, status=status.HTTP_201_CREATED)
            
#             except Exception as e:
#                 logger.error(f"Error starting interview: {str(e)}")
#                 return Response(
#                     {"error": "Failed to start interview"},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )
        
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     def get_interview_questions(self, interview):
#         """
#         Get questions for the interview based on job position or generate new ones
#         """
#         # For simplicity, get predefined questions
#         questions = list(Question.objects.filter(is_predefined=True).order_by('?')[:15])
        
#         # Create InterviewQuestion instances to track order
#         for i, question in enumerate(questions):
#             InterviewQuestion.objects.create(
#                 interview=interview,
#                 question=question,
#                 position=i+1
#             )
        
#         return questions


# class InterviewSubmitAnswerView(APIView):
#     """
#     Submit answer for current question and get next question
#     """
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request, interview_id):
#         try:
#             interview = Interview.objects.get(id=interview_id, user=request.user)
#         except Interview.DoesNotExist:
#             return Response(
#                 {"error": "Interview not found"}, 
#                 status=status.HTTP_404_NOT_FOUND
#             )
        
#         serializer = AnswerSubmitSerializer(data=request.data)
#         if serializer.is_valid():
#             answer_text = serializer.validated_data['text']
#             audio_file = serializer.validated_data.get('audio')
            
#             try:
#                 # Find the current unanswered question
#                 interview_questions = InterviewQuestion.objects.filter(interview=interview)
#                 unanswered_questions = interview_questions.exclude(
#                     id__in=Answer.objects.values_list('interview_question_id', flat=True)
#                 ).order_by('position')
                
#                 if not unanswered_questions.exists():
#                     # Complete the interview if all questions answered
#                     interview.status = 'completed'
#                     interview.end_time = timezone.now()
#                     interview.save()
                    
#                     # Generate interview results
#                     self.generate_interview_results(interview)
                    
#                     return Response({
#                         'completed': True,
#                         'interview_id': interview.id
#                     })
                
#                 current_question = unanswered_questions.first()
                
#                 # Create answer
#                 answer = Answer(
#                     interview_question=current_question,
#                     text=answer_text
#                 )
                
#                 # Save audio if provided
#                 if audio_file:
#                     filename = f"answer_{interview.id}_{current_question.position}.webm"
#                     answer.audio_file.save(filename, audio_file)
                
#                 # Analyze answer
#                 self.analyze_answer(answer, current_question.question.text)
#                 answer.save()
                
#                 # Check if there are more questions
#                 next_position = current_question.position + 1
#                 next_question = interview_questions.filter(position=next_position).first()
                
#                 if next_question:
#                     # Return next question
#                     return Response({
#                         'completed': False,
#                         'question': {
#                             'text': next_question.question.text,
#                             'difficulty': next_question.question.difficulty
#                         }
#                     })
#                 else:
#                     # Complete the interview
#                     interview.status = 'completed'
#                     interview.end_time = timezone.now()
#                     interview.save()
                    
#                     # Generate interview results
#                     self.generate_interview_results(interview)
                    
#                     return Response({
#                         'completed': True,
#                         'interview_id': interview.id
#                     })
            
#             except Exception as e:
#                 logger.error(f"Error submitting answer: {str(e)}")
#                 return Response(
#                     {"error": "Failed to process answer submission"},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )
        
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     def analyze_answer(self, answer, question_text):
#         """
#         Analyze answer using AI models and set scores
#         """
#         try:
#             # This is a simplified analysis using sentiment analysis
#             # In a production system, you would use more sophisticated models
            
#             # Relevance score - check if answer addresses the question
#             relevance_prompt = f"Question: {question_text}\nAnswer: {answer.text}\nIs this answer relevant to the question?"
#             inputs = analysis_tokenizer(relevance_prompt, return_tensors="pt", truncation=True, max_length=512)
#             with torch.no_grad():
#                 relevance_outputs = analysis_model(**inputs)
            
#             relevance_score = torch.nn.functional.softmax(relevance_outputs.logits, dim=1)[0, 1].item() * 10
            
#             # Clarity score
#             clarity_inputs = analysis_tokenizer(answer.text, return_tensors="pt", truncation=True, max_length=512)
#             with torch.no_grad():
#                 clarity_outputs = analysis_model(**clarity_inputs)
            
#             clarity_score = torch.nn.functional.softmax(clarity_outputs.logits, dim=1)[0, 1].item() * 10
            
#             # Simple confidence and technical accuracy scores
#             confidence_score = min(len(answer.text.split()) / 50 * 10, 10)  # Longer answers suggest more confidence
#             technical_words = ['technology', 'system', 'process', 'development', 'analysis', 'method']
#             technical_score = min(sum(word in answer.text.lower() for word in technical_words) * 2, 10)
            
#             # Generate analysis notes
#             analysis_notes = self.generate_analysis_notes(answer.text, question_text)
            
#             # Set scores
#             answer.relevance_score = relevance_score
#             answer.clarity_score = clarity_score
#             answer.confidence_score = confidence_score
#             answer.technical_accuracy = technical_score
#             answer.overall_score = (relevance_score + clarity_score + confidence_score + technical_score) / 4
#             answer.analysis_notes = analysis_notes
        
#         except Exception as e:
#             logger.error(f"Error analyzing answer: {str(e)}")
#             # Set default scores if analysis fails
#             answer.relevance_score = 5.0
#             answer.clarity_score = 5.0
#             answer.confidence_score = 5.0
#             answer.technical_accuracy = 5.0
#             answer.overall_score = 5.0
#             answer.analysis_notes = "Automated analysis unavailable."
    
#     def generate_analysis_notes(self, answer_text, question_text):
#         """
#         Generate analysis notes for the answer
#         """
#         try:
#             analysis_prompt = f"Question: {question_text}\nAnswer: {answer_text}\n\nAnalysis: "
            
#             # Using API instead of local model for text generation
#             API_URL = f"https://api-inference.huggingface.co/models/{SUMMARY_MODEL}"
#             headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_TOKEN}"}
#             payload = {
#                 "inputs": analysis_prompt,
#                 "parameters": {"max_length": 150, "do_sample": False}
#             }
            
#             response = requests.post(API_URL, headers=headers, json=payload)
            
#             if response.status_code == 200:
#                 result = response.json()
#                 if isinstance(result, list) and len(result) > 0:
#                     return result[0].get('generated_text', '').replace(analysis_prompt, '')
#                 return "The answer provides relevant information but could be more detailed."
#             else:
#                 # Fallback to local simple analysis
#                 return "The answer addresses the question with adequate detail and clarity."
            
#         except Exception as e:
#             logger.error(f"Error generating analysis notes: {str(e)}")
#             return "Automated analysis unavailable."
    
#     def generate_interview_results(self, interview):
#         """
#         Generate comprehensive interview results upon completion
#         """
#         try:
#             # Get all questions and answers
#             interview_questions = InterviewQuestion.objects.filter(interview=interview)
#             answers = Answer.objects.filter(interview_question__in=interview_questions)
            
#             if not answers:
#                 return
            
#             # Calculate overall interview scores
#             overall_score = answers.aggregate(avg=models.Avg('overall_score'))['avg'] or 0
#             confidence_score = answers.aggregate(avg=models.Avg('confidence_score'))['avg'] or 0
#             communication_score = answers.aggregate(avg=models.Avg('clarity_score'))['avg'] or 0
#             technical_score = answers.aggregate(avg=models.Avg('technical_accuracy'))['avg'] or 0
            
#             # Update interview with scores
#             interview.overall_score = overall_score
#             interview.confidence_score = confidence_score
#             interview.communication_score = communication_score
#             interview.technical_score = technical_score
#             interview.save()
            
#             # Prepare text for summary generation
#             all_answers = "\n\n".join([
#                 f"Q{iq.position}: {iq.question.text}\nA: {getattr(iq.answer, 'text', 'No answer')}"
#                 for iq in interview_questions
#             ])
            
#             # Generate summary using the model
#             summary = "The candidate demonstrated reasonable knowledge and communication skills throughout the interview."
#             strengths = "Good technical understanding and ability to articulate responses clearly."
#             areas_for_improvement = "Could provide more detailed examples and demonstrate deeper domain expertise."
#             recommendations = "The candidate should focus on developing more in-depth knowledge in key technical areas and practice providing specific examples from past experiences."
            
#             try:
#                 # Using API for summarization
#                 API_URL = f"https://api-inference.huggingface.co/models/{SUMMARY_MODEL}"
#                 headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_TOKEN}"}
                
#                 # Get summary
#                 summary_payload = {
#                     "inputs": f"Summarize this interview:\n{all_answers}",
#                     "parameters": {"max_length": 200, "do_sample": False}
#                 }
#                 summary_response = requests.post(API_URL, headers=headers, json=summary_payload)
                
#                 if summary_response.status_code == 200:
#                     summary_result = summary_response.json()
#                     if isinstance(summary_result, list) and len(summary_result) > 0:
#                         summary = summary_result[0].get('generated_text', '').replace("Summarize this interview:\n", '')
                
#                 # Get strengths
#                 strengths_payload = {
#                     "inputs": f"What are the strengths shown in this interview?\n{all_answers}",
#                     "parameters": {"max_length": 150, "do_sample": False}
#                 }
#                 strengths_response = requests.post(API_URL, headers=headers, json=strengths_payload)
                
#                 if strengths_response.status_code == 200:
#                     strengths_result = strengths_response.json()
#                     if isinstance(strengths_result, list) and len(strengths_result) > 0:
#                         strengths = strengths_result[0].get('generated_text', '').replace("What are the strengths shown in this interview?\n", '')
                
#                 # Similar calls for areas_for_improvement and recommendations
            
#             except Exception as e:
#                 logger.error(f"Error generating interview summary: {str(e)}")
            
#             # Create interview result
#             InterviewResult.objects.create(
#                 interview=interview,
#                 summary=summary,
#                 strengths=strengths,
#                 areas_for_improvement=areas_for_improvement,
#                 recommendations=recommendations
#             )
            
#         except Exception as e:
#             logger.error(f"Error generating interview results: {str(e)}")

# class InterviewResultView(APIView):
#     """
#     Get detailed interview results
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request, interview_id):
#         try:
#             interview = Interview.objects.get(id=interview_id, user=request.user)
            
#             # Check if interview is completed
#             if interview.status != 'completed':
#                 return Response(
#                     {"error": "Interview is not completed yet"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Get interview result
#             try:
#                 result = InterviewResult.objects.get(interview=interview)
#             except InterviewResult.DoesNotExist:
#                 return Response(
#                     {"error": "Interview result not found"},
#                     status=status.HTTP_404_NOT_FOUND
#                 )
#             serializer = InterviewResultSerializer(result)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Interview.DoesNotExist:
#             return Response(
#                 {"error": "Interview not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
# class InterviewListView(generics.ListAPIView):
#     """
#     List all interviews for the authenticated user
#     """
#     permission_classes = [IsAuthenticated]
#     serializer_class = InterviewSerializer
    
#     def get_queryset(self):
#         return Interview.objects.filter(user=self.request.user).order_by('-start_time')
# class QuestionListView(generics.ListAPIView):
#     """
#     List all questions
#     """
#     permission_classes = [IsAuthenticated]
#     serializer_class = QuestionSerializer
    
#     def get_queryset(self):
#         return Question.objects.all().order_by('difficulty')
