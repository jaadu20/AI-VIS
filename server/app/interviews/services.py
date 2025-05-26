# services.py
import os
import json
import requests
import azure.cognitiveservices.speech as speechsdk
from transformers import AutoTokenizer, AutoModelForCausalLM
from huggingface_hub import login
import torch
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
import tempfile
import logging

logger = logging.getLogger(__name__)

class AzureSpeechService:
    def __init__(self):
        self.speech_key = settings.AZURE_SPEECH_KEY
        self.service_region = settings.AZURE_SPEECH_REGION
        
    def text_to_speech(self, text, filename=None):
        """Convert text to speech using Azure TTS"""
        try:
            speech_config = speechsdk.SpeechConfig(
                subscription=self.speech_key, 
                region=self.service_region
            )
            speech_config.speech_synthesis_voice_name = "en-US-AriaNeural"
            
            if filename:
                audio_config = speechsdk.audio.AudioOutputConfig(filename=filename)
            else:
                audio_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=True)
                
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=speech_config, 
                audio_config=audio_config
            )
            
            result = synthesizer.speak_text_async(text).get()
            
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                return True, filename if filename else result.audio_data
            else:
                logger.error(f"Speech synthesis failed: {result.reason}")
                return False, None
                
        except Exception as e:
            logger.error(f"Azure TTS error: {str(e)}")
            return False, None
    
    def speech_to_text(self, audio_file):
        """Convert speech to text using Azure STT"""
        try:
            speech_config = speechsdk.SpeechConfig(
                subscription=self.speech_key, 
                region=self.service_region
            )
            
            audio_config = speechsdk.audio.AudioConfig(filename=audio_file)
            speech_recognizer = speechsdk.SpeechRecognizer(
                speech_config=speech_config, 
                audio_config=audio_config
            )
            
            result = speech_recognizer.recognize_once()
            
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                return True, result.text
            else:
                logger.error(f"Speech recognition failed: {result.reason}")
                return False, ""
                
        except Exception as e:
            logger.error(f"Azure STT error: {str(e)}")
            return False, ""

class QuestionGeneratorService:
    def __init__(self):
        # Initialize Hugging Face model
        login(token=settings.HUGGINGFACE_TOKEN)
        self.model_id = "meta-llama/Llama-3.1-8B"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_id)
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_id,
            torch_dtype=torch.float16,
            device_map="auto",
            attn_implementation="sdpa"
        )
        
        self.difficulty_prompts = {
            'easy': {
                'system_prompt': "You are conducting a beginner-level technical interview. Generate basic questions that test fundamental concepts and general knowledge.",
                'instruction': "Generate 1 easy interview question that focuses on basic concepts, definitions, or simple problem-solving."
            },
            'medium': {
                'system_prompt': "You are conducting an intermediate-level technical interview. Generate questions that test practical application and deeper understanding.",
                'instruction': "Generate 1 medium-difficulty interview question that requires practical knowledge and some analysis."
            },
            'hard': {
                'system_prompt': "You are conducting an advanced technical interview. Generate challenging questions that test complex problem-solving and expert knowledge.",
                'instruction': "Generate 1 hard interview question that requires advanced knowledge, complex reasoning, or system design thinking."
            }
        }
    
    def generate_question(self, job_description: str, difficulty: str = 'easy') -> str:
        """Generate a single interview question based on job description and difficulty"""
        try:
            prompt_config = self.difficulty_prompts.get(difficulty, self.difficulty_prompts['easy'])
            
            prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
{prompt_config['system_prompt']}

Job Description: {job_description}

{prompt_config['instruction']}
Return ONLY the question without numbering or additional commentary.<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
"""
            
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
            
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=150,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                num_return_sequences=1,
                pad_token_id=self.tokenizer.eos_token_id,
                eos_token_id=self.tokenizer.eos_token_id
            )
            
            generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract just the question part
            question_start = generated_text.find("<|start_header_id|>assistant<|end_header_id|>")
            if question_start != -1:
                question = generated_text[question_start + len("<|start_header_id|>assistant<|end_header_id|>"):].strip()
            else:
                question = generated_text.split("assistant<|end_header_id|>")[-1].strip()
            
            # Clean up the question
            question = question.split('\n')[0].strip()
            if not question.endswith('?'):
                question += '?'
                
            return question
            
        except Exception as e:
            logger.error(f"Question generation error: {str(e)}")
            # Fallback questions
            fallback_questions = {
                'easy': f"Can you tell me about your experience with the technologies mentioned in this role?",
                'medium': f"Describe a challenging project you've worked on and how you approached solving it.",
                'hard': f"How would you design a scalable system for the requirements described in this job posting?"
            }
            return fallback_questions.get(difficulty, fallback_questions['easy'])

class AnswerScoringService:
    def __init__(self):
        self.grok_api_key = settings.GROK_API_KEY
        self.grok_api_url = "https://api.x.ai/v1/chat/completions"
    
    def score_answer(self, question: str, answer: str, job_description: str) -> tuple:
        """Score an answer using Grok API and return score (1-10) and feedback"""
        try:
            headers = {
                "Authorization": f"Bearer {self.grok_api_key}",
                "Content-Type": "application/json"
            }
            
            scoring_prompt = f"""
You are an expert technical interviewer. Score the following interview answer on a scale of 1-10 and provide brief feedback.

Job Context: {job_description}

Question: {question}

Answer: {answer}

Please provide:
1. A score from 1-10 (where 1 is very poor and 10 is excellent)
2. Brief feedback (2-3 sentences) explaining the score

Respond in JSON format:
{{
    "score": <number>,
    "feedback": "<feedback text>"
}}
"""
            
            payload = {
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert technical interviewer who provides fair and constructive assessment of interview answers."
                    },
                    {
                        "role": "user", 
                        "content": scoring_prompt
                    }
                ],
                "model": "grok-beta",
                "temperature": 0.3
            }
            
            response = requests.post(self.grok_api_url, headers=headers, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                
                # Parse JSON response
                try:
                    score_data = json.loads(content)
                    score = float(score_data.get('score', 5.0))
                    feedback = score_data.get('feedback', 'No specific feedback provided.')
                    
                    # Ensure score is within bounds
                    score = max(1.0, min(10.0, score))
                    
                    return score, feedback
                    
                except json.JSONDecodeError:
                    # Fallback parsing if JSON is malformed
                    score = 5.0
                    feedback = "Unable to parse detailed feedback from scoring service."
                    return score, feedback
            else:
                logger.error(f"Grok API error: {response.status_code}")
                return 5.0, "Scoring service temporarily unavailable."
                
        except Exception as e:
            logger.error(f"Answer scoring error: {str(e)}")
            return 5.0, "Error occurred during answer evaluation."

# Initialize services
azure_speech = AzureSpeechService()
question_generator = QuestionGeneratorService()
answer_scorer = AnswerScoringService()