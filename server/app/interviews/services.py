# interviews/services.py
import uuid
import azure.cognitiveservices.speech as speechsdk
from groq import Groq
import requests
import tempfile
import os
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
import librosa
import numpy as np
from transformers import pipeline
import cv2
from django.utils import timezone

class AzureSpeechService:
    def __init__(self):
        self.speech_key = settings.AZURE_SPEECH_KEY
        self.service_region = settings.AZURE_SPEECH_REGION
        
    def text_to_speech(self, text, voice_name="en-US-AriaNeural"):
        """Convert text to speech and return audio URL"""
        speech_config = speechsdk.SpeechConfig(
            subscription=self.speech_key, 
            region=self.service_region
        )
        speech_config.speech_synthesis_voice_name = voice_name
        
        # Create synthesizer with file output
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        audio_config = speechsdk.audio.AudioOutputConfig(filename=temp_file.name)
        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=speech_config, 
            audio_config=audio_config
        )
        
        # Synthesize text
        result = synthesizer.speak_text_async(text).get()
        
        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            # Save to storage and return URL
            with open(temp_file.name, 'rb') as f:
                audio_content = f.read()
            
            # Save to media storage
            filename = f"tts_audio/{uuid.uuid4()}.wav"
            saved_path = default_storage.save(filename, ContentFile(audio_content))
            audio_url = default_storage.url(saved_path)
            
            # Cleanup temp file
            os.unlink(temp_file.name)
            return audio_url
        else:
            os.unlink(temp_file.name)
            raise Exception(f"Speech synthesis failed: {result.reason}")
    
    def speech_to_text(self, audio_file):
        """Convert speech to text"""
        speech_config = speechsdk.SpeechConfig(
            subscription=self.speech_key, 
            region=self.service_region
        )
        
        # Create audio config from file
        audio_config = speechsdk.audio.AudioConfig(filename=audio_file.path)
        speech_recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config, 
            audio_config=audio_config
        )
        
        # Recognize speech
        result = speech_recognizer.recognize_once()
        
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            return result.text
        elif result.reason == speechsdk.ResultReason.NoMatch:
            return "No speech could be recognized"
        else:
            raise Exception(f"Speech recognition failed: {result.reason}")

class HuggingFaceService:
    def __init__(self):
        self.api_token = settings.HUGGINGFACE_API_TOKEN
        self.model_name = "mistralai/Mixtral-8x7B-Instruct-v0.1"
        
    def generate_question(self, prompt, job_description, previous_questions=None):
        """Generate interview question using Hugging Face model"""
        
        # Format the prompt with job description
        formatted_prompt = f"""
        Job Description: {job_description}
        
        Previous Questions Asked: {previous_questions or "None"}
        
        {prompt}
        
        Generate a single, specific interview question that:
        1. Is relevant to the job description
        2. Has not been asked before
        3. Can be answered in 2-3 minutes
        4. Is clear and professional
        
        Question:"""
        
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": formatted_prompt,
            "parameters": {
                "max_new_tokens": 150,
                "temperature": 0.7,
                "top_p": 0.9,
                "return_full_text": False
            }
        }
        
        response = requests.post(
            f"https://api-inference.huggingface.co/models/{self.model_name}",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get('generated_text', '').strip()
                # Clean up the question
                if generated_text.startswith('Question:'):
                    generated_text = generated_text[9:].strip()
                return generated_text
            else:
                raise Exception("Invalid response format from Hugging Face")
        else:
            raise Exception(f"Hugging Face API error: {response.status_code}")

class GroqScoringService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        
    def score_answer(self, question, answer, job_description):
        """Score the answer using Groq API"""
        prompt = f"""
        Job Description: {job_description}
        
        Interview Question: {question}
        
        Candidate's Answer: {answer}
        
        Please evaluate this answer on a scale of 0-10 based on:
        1. Relevance to the question (0-3 points)
        2. Technical accuracy and depth (0-3 points)
        3. Communication clarity (0-2 points)
        4. Professional experience demonstration (0-2 points)
        
        Provide ONLY a numeric score between 0-10 (can include decimals like 7.5).
        Do not include any explanation, just the number.
        """
        
        try:
            completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert interviewer. Provide only numeric scores between 0-10."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model="llama3-8b-8192",
                temperature=0.3,
                max_tokens=10
            )
            
            score_text = completion.choices[0].message.content.strip()
            # Extract numeric value
            try:
                score = float(score_text)
                return min(max(score, 0), 10)  # Ensure score is between 0-10
            except ValueError:
                # Fallback: try to extract number from text
                import re
                numbers = re.findall(r'\d+\.?\d*', score_text)
                if numbers:
                    score = float(numbers[0])
                    return min(max(score, 0), 10)
                else:
                    return 5.0  # Default score if parsing fails
                    
        except Exception as e:
            print(f"Groq scoring error: {e}")
            return 5.0  # Default score on error

class AudioAnalysisService:
    def __init__(self):
        # Load pre-trained model for emotion detection
        self.emotion_classifier = pipeline(
            "audio-classification", 
            model="superb/wav2vec2-base-superb-er"
        )
    
    def analyze_audio(self, audio_file_path):
        """Analyze audio quality and emotional tone"""
        try:
            # Load audio file
            audio, sr = librosa.load(audio_file_path, sr=16000)
            
            # Calculate audio quality metrics
            rms_energy = np.sqrt(np.mean(audio**2))
            zero_crossing_rate = librosa.feature.zero_crossing_rate(audio)[0]
            spectral_centroid = librosa.feature.spectral_centroid(audio=audio, sr=sr)[0]
            
            # Normalize metrics to 0-10 scale
            energy_score = min(rms_energy * 50, 10)  # Scale energy
            clarity_score = min((1 - np.mean(zero_crossing_rate)) * 10, 10)
            pitch_score = min(np.mean(spectral_centroid) / 1000, 10)
            
            # Calculate overall audio score
            audio_score = (energy_score + clarity_score + pitch_score) / 3
            
            return min(max(audio_score, 0), 10)
            
        except Exception as e:
            print(f"Audio analysis error: {e}")
            return 5.0  # Default score on error

class VideoAnalysisService:
    def __init__(self):
        # Pre-trained models would be loaded here
        pass
    
    def analyze_video(self, video_file_path):
        """Analyze video for posture, eye contact, and professionalism"""
        try:
            cap = cv2.VideoCapture(video_file_path)
            
            frame_scores = []
            frame_count = 0
            
            while cap.read()[0] and frame_count < 30:  # Analyze first 30 frames
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Simple analysis - in production, use more sophisticated models
                # For now, we'll use basic metrics
                
                # Check image quality
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
                
                # Normalize sharpness score
                sharpness_score = min(laplacian_var / 100, 10)
                
                # Check brightness
                brightness = np.mean(gray)
                brightness_score = 10 - abs(brightness - 128) / 12.8
                
                frame_score = (sharpness_score + brightness_score) / 2
                frame_scores.append(frame_score)
                frame_count += 1
            
            cap.release()
            
            if frame_scores:
                video_score = np.mean(frame_scores)
                return min(max(video_score, 0), 10)
            else:
                return 5.0
                
        except Exception as e:
            print(f"Video analysis error: {e}")
            return 5.0  # Default score on error

class InterviewService:
    def __init__(self):
        self.speech_service = AzureSpeechService()
        self.hf_service = HuggingFaceService()
        self.groq_service = GroqScoringService()
        self.audio_service = AudioAnalysisService()
        self.video_service = VideoAnalysisService()
        
        # Predefined questions
        self.predefined_questions = [
            "Tell me about yourself and your professional background.",
            "Why are you interested in this position and our company?"
        ]
        
        # Question generation prompts based on difficulty
        self.question_prompts = {
            'easy': """
            Generate an easy-level interview question that tests basic knowledge and experience.
            The question should be straightforward and allow the candidate to showcase their fundamental skills.
            Focus on general experience, basic concepts, or introductory scenarios.
            """,
            'medium': """
            Generate a medium-level interview question that tests practical application and problem-solving.
            The question should require the candidate to think through scenarios and demonstrate deeper understanding.
            Focus on real-world applications, process explanations, or situational challenges.
            """,
            'hard': """
            Generate a hard-level interview question that tests advanced knowledge and critical thinking.
            The question should challenge the candidate with complex scenarios or technical depth.
            Focus on advanced concepts, system design, leadership scenarios, or complex problem-solving.
            """
        }
    
    def start_interview(self, application_id=None):
        """Start a new interview"""
        from .models import Interview
        from interview_applications.models import Application
        
        if application_id:
            application = Application.objects.get(id=application_id)
        else:
            # Create a demo application for testing
            application = None
        
        interview = Interview.objects.create(
            application=application,
            status='in_progress',
            started_at=timezone.now()
        )
        
        # Generate introduction audio
        intro_text = """
        Welcome to your AI-powered interview session. I'm your virtual interviewer, 
        and I'll be asking you a series of questions to assess your qualifications 
        and fit for this position. Please speak clearly and take your time with each answer. 
        Let's begin with our first question.
        """
        
        intro_audio_url = self.speech_service.text_to_speech(intro_text)
        
        return {
            'interview_id': str(interview.id),
            'intro_audio_url': intro_audio_url,
            'status': 'started'
        }
    
    def get_next_question(self, interview_id):
        """Get the next question for the interview"""
        from .models import Interview, Question
        
        interview = Interview.objects.get(id=interview_id)
        current_index = interview.current_question_index
        
        # Check if interview is complete (15 questions total)
        if current_index >= 15:
            interview.status = 'completed'
            interview.completed_at = timezone.now()
            interview.save()
            return {'completed': True}
        
        # Generate question based on current index
        if current_index < 2:
            # First two questions are predefined
            question_text = self.predefined_questions[current_index]
            difficulty = 'easy'
            question_type = 'predefined'
        else:
            # Generate question based on previous answer scores
            difficulty = self._determine_next_difficulty(interview)
            job_description = interview.application.job.description if interview.application else "General software development position"
            
            # Get previous questions to avoid repetition
            previous_questions = list(
                interview.questions.values_list('text', flat=True)
            )
            
            question_text = self.hf_service.generate_question(
                self.question_prompts[difficulty],
                job_description,
                previous_questions
            )
            question_type = 'generated'
        
        # Create question record
        question = Question.objects.create(
            interview=interview,
            text=question_text,
            difficulty=difficulty,
            question_type=question_type,
            order=current_index + 1
        )
        
        # Generate audio for question
        audio_url = self.speech_service.text_to_speech(question_text)
        question.audio_url = audio_url
        question.save()
        
        return {
            'question_id': str(question.id),
            'question_text': question_text,
            'difficulty': difficulty,
            'question_audio_url': audio_url,
            'completed': False
        }
    
    def _determine_next_difficulty(self, interview):
        """Determine difficulty of next question based on previous scores"""
        recent_answers = interview.questions.filter(
            answer__isnull=False
        ).order_by('-order')[:3]
        
        if not recent_answers.exists():
            return 'easy'
        
        # Calculate average score of recent answers
        scores = []
        for question in recent_answers:
            if question.answer.overall_score:
                scores.append(float(question.answer.overall_score))
        
        if not scores:
            return 'easy'
        
        avg_score = sum(scores) / len(scores)
        
        # Determine difficulty based on average score
        if avg_score >= 7.5:
            return 'hard'
        elif avg_score >= 5.0:
            return 'medium'
        else:
            return 'easy'
    
    def submit_answer(self, interview_id, question_id, answer_text, audio_file=None, video_file=None):
        """Submit answer and calculate scores"""
        from .models import Interview, Question, Answer
        
        interview = Interview.objects.get(id=interview_id)
        question = Question.objects.get(id=question_id)
        
        # Create answer record
        answer = Answer.objects.create(
            question=question,
            text=answer_text,
            audio_file=audio_file,
            video_file=video_file
        )
        
        # Score the content using Groq
        job_description = interview.application.job.description if interview.application else "General software development position"
        content_score = self.groq_service.score_answer(
            question.text, 
            answer_text, 
            job_description
        )
        answer.content_score = content_score
        
        # Score audio if provided
        if audio_file:
            audio_score = self.audio_service.analyze_audio(audio_file.path)
            answer.audio_score = audio_score
        
        # Score video if provided
        if video_file:
            video_score = self.video_service.analyze_video(video_file.path)
            answer.video_score = video_score
        
        # Calculate overall score
        answer.calculate_overall_score()
        
        # Update interview progress
        interview.current_question_index += 1
        interview.save()
        
        # Check if interview is complete
        if interview.current_question_index >= 15:
            # Calculate total interview score
            total_scores = []
            for q in interview.questions.filter(answer__isnull=False):
                if q.answer.overall_score:
                    total_scores.append(float(q.answer.overall_score))
            
            if total_scores:
                interview.total_score = sum(total_scores) / len(total_scores)
                interview.status = 'completed'
                interview.completed_at = timezone.now()
                interview.save()
            
            return {'completed': True, 'interview_id': str(interview.id)}
        
        return {'completed': False, 'next_question': True}
    
    def convert_speech_to_text(self, audio_file):
        """Convert speech to text"""
        return self.speech_service.speech_to_text(audio_file)