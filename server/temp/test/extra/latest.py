import os
import re
import torch
import logging
from dotenv import load_dotenv
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import azure.cognitiveservices.speech as speechsdk

# Suppress warnings and optimize environment
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TOKENIZERS_PARALLELISM'] = 'false'
logging.getLogger("transformers").setLevel(logging.ERROR)
logging.getLogger("torch").setLevel(logging.ERROR)

# Load environment variables
load_dotenv()

class MultiModelInterviewSystem:
    def __init__(self, job_description):
        self.job_desc = job_description
        self.speech_service = AzureSpeechService()
        self.conversation_history = []
        self.current_focus_areas = []
        self.difficulty_level = 1  # 0: easy, 1: medium, 2: hard
        self.knowledge_gaps = []

        self.models = {
            'question_generator': self._load_model("nvidia/Llama-3_3-Nemotron-Super-49B-v1"),
            'answer_analyzer': self._load_model("nvidia/Llama-3_3-Nemotron-Super-49B-v1"),
            'summary_generator': self._load_model("nvidia/Llama-3_3-Nemotron-Super-49B-v1")
        }

        # Initialize focus areas
        self.current_focus_areas = self._get_focus_areas()

    def _load_model(self, model_name):
        """Load a model with proper configuration and error handling"""
        try:
            tokenizer = AutoTokenizer.from_pretrained(
                model_name,
                padding_side="left"
            )
            tokenizer.pad_token = tokenizer.eos_token

            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.bfloat16,
                device_map="auto",
                load_in_4bit=True
            )
            
            return {
                'model': model,
                'tokenizer': tokenizer,
                'generator': pipeline(
                    'text-generation',
                    model=model,
                    tokenizer=tokenizer,
                    device_map="auto",
                    pad_token_id=tokenizer.eos_token_id
                )
            }
        except Exception as e:
            print(f"Error loading {model_name}: {str(e)}")
            return None

    def _get_focus_areas(self):
        """Extract technical focus areas from job description"""
        prompt = f"""Analyze this job description and extract technical focus areas:
        {self.job_desc}

        Consider these categories:
        - Core Programming: OOP, Algorithms, Design Patterns
        - System Design: Distributed systems, Microservices
        - Database: SQL/NoSQL, Optimization, ORM
        - Cloud: AWS/GCP/Azure, Kubernetes, Docker
        - Testing: Unit/Integration tests, TDD
        - DevOps: CI/CD, Infrastructure as Code

        Return 3-5 primary focus areas.
        Format: <FocusAreas>category1, category2</FocusAreas>
        """
        
        response = self._generate_response(
            prompt=prompt,
            model_name='question_generator',
            max_tokens=150
        )
        
        areas = re.search(r"<FocusAreas>(.*?)</FocusAreas>", response)
        return [a.strip() for a in areas.group(1).split(',')] if areas else ["System Design", "Core Programming"]

    def _generate_response(self, prompt, model_name='question_generator', **kwargs):
        """Generate text response from specified model"""
        model_config = self.models.get(model_name)
        if not model_config:
            return ""

        try:
            inputs = model_config['tokenizer'](
                prompt,
                return_tensors="pt",
                return_attention_mask=True,
                padding=True,
                truncation=True,
                max_length=2048
            ).to(model_config['model'].device)

            outputs = model_config['model'].generate(
                inputs.input_ids,
                attention_mask=inputs.attention_mask,
                max_new_tokens=kwargs.get('max_tokens', 512),
                temperature=kwargs.get('temperature', 0.7),
                top_p=kwargs.get('top_p', 0.9),
                do_sample=True,
                pad_token_id=model_config['tokenizer'].eos_token_id
            )
            return model_config['tokenizer'].decode(outputs[0], skip_special_tokens=True)
        except Exception as e:
            print(f"Generation error ({model_name}): {str(e)}")
            return ""

    def _extract_tag(self, text, tag_name):
        """Extract content between XML-like tags"""
        match = re.search(rf"<{tag_name}>(.*?)</{tag_name}>", text, re.DOTALL)
        return match.group(1).strip() if match else None

    def generate_question(self):
        """Generate context-aware technical question"""
        if not self.conversation_history:
            return self._generate_opening_question()
        return self._generate_follow_up_question()

    def _generate_opening_question(self):
        """Generate initial technical question"""
        prompt = f"""Create a senior-level technical question for {self.job_desc}.
        Focus: {self.current_focus_areas[0]}
        Difficulty: {['Basic','Intermediate','Advanced'][self.difficulty_level]}
        
        Include:
        - Real-world scenario
        - Multiple components to design
        - Potential failure points
        - Technology tradeoffs
        
        Format: <Question>Your question</Question><Type>System Design/Code/Debug</Type>
        """
        
        response = self._generate_response(prompt, max_tokens=400)
        question = self._extract_tag(response, "Question")
        return question or "Design a globally distributed cache system with consistency guarantees"

    def _generate_follow_up_question(self):
        """Generate depth-focused follow-up question"""
        history = "\n".join([f"Q{i+1}: {q}\nA: {a[:200]}" 
                           for i, (q, a, _) in enumerate(self.conversation_history[-2:])])

        prompt = f"""Generate follow-up question based on:
        {history}
        
        Current Focus: {self.current_focus_areas}
        Required Aspects:
        - Technical implementation details
        - Alternative approaches
        - Failure scenarios
        - Performance optimization
        
        Format: <Question>Your question</Question><Focus>Technical Area</Focus>
        """
        
        response = self._generate_response(prompt, max_tokens=400)
        question = self._extract_tag(response, "Question")
        focus = self._extract_tag(response, "Focus")
        
        if focus and focus not in self.current_focus_areas:
            self.current_focus_areas.append(focus)
            
        return question or "How would you handle network partitions in your design?"

    def analyze_answer(self, question, answer):
        """Evaluate technical answer quality"""
        prompt = f"""Analyze this technical response:
        Q: {question}
        A: {answer}

        Evaluate:
        1. Technical accuracy (1-5)
        2. Solution completeness (1-5)
        3. Error handling quality
        4. Alternative approaches considered
        5. Code quality practices
        
        Provide:
        - Weaknesses (comma-separated)
        - Difficulty adjustment (-1, 0, +1)
        - Knowledge gaps to address
        
        Format:
        <TechnicalScore>4</TechnicalScore>
        <Weaknesses>missing error handling, no scalability considerations</Weaknesses>
        <DifficultyAdjust>+1</DifficultyAdjust>
        <KnowledgeGaps>distributed consensus, circuit breakers</KnowledgeGaps>
        """
        
        response = self._generate_response(prompt, model_name='answer_analyzer', max_tokens=300)
        
        return {
            'score': int(self._extract_tag(response, "TechnicalScore") or 3),
            'weaknesses': self._extract_tag(response, "Weaknesses").split(', ') if self._extract_tag(response, "Weaknesses") else [],
            'difficulty_adj': self._safe_int(self._extract_tag(response, "DifficultyAdjust")),
            'gaps': self._extract_tag(response, "KnowledgeGaps").split(', ') if self._extract_tag(response, "KnowledgeGaps") else []
        }

    def _safe_int(self, value):
        """Safe integer conversion"""
        try:
            return int(value or 0)
        except ValueError:
            return 0

    def conduct_interview(self):
        """Execute full interview flow"""
        try:
            self.speech_service.text_to_speech(f"Starting {self.job_desc} technical interview")
            current_question = self.generate_question()
            
            for q_num in range(10):
                # Ask question
                self.speech_service.text_to_speech(current_question)
                print(f"\n[Q{q_num+1}] {current_question}")

                # Get answer
                answer = None
                while not answer:
                    answer = self.speech_service.recognize_speech()
                    if not answer:
                        self.speech_service.text_to_speech("Please repeat your answer")
                print(f"Answer: {answer[:200]}...")

                # Analyze response
                analysis = self.analyze_answer(current_question, answer)
                self.conversation_history.append((current_question, answer, analysis))
                
                # Update difficulty
                self.difficulty_level = max(0, min(2, 
                    self.difficulty_level + analysis['difficulty_adj']))
                
                # Update knowledge gaps
                self.knowledge_gaps.extend(analysis['gaps'])
                
                # Generate next question
                current_question = self.generate_question()

                # Provide feedback
                if analysis['score'] < 3:
                    self.speech_service.text_to_speech("Let's explore this further")
                elif analysis['score'] > 4:
                    self.speech_service.text_to_speech("Excellent, increasing complexity")

            self._generate_final_report()

        except Exception as e:
            self.speech_service.text_to_speech("Interview session interrupted")
            print(f"Error: {str(e)}")

    def _generate_final_report(self):
        """Generate comprehensive interview summary"""
        report = [
            "\nTechnical Interview Report",
            "="*40,
            f"Position: {self.job_desc}",
            f"Difficulty Progression: {self._get_difficulty_history()}",
            "\nQuestion Analysis:"
        ]
        
        for idx, (q, a, analysis) in enumerate(self.conversation_history):
            report.append(
                f"{idx+1}. [{analysis['score']}/5] {q}\n"
                f"   Key Gaps: {', '.join(analysis['gaps'])}\n"
                f"   Weaknesses: {', '.join(analysis['weaknesses'])}"
            )
        
        report.append("\nFinal Assessment:")
        report.append(self.generate_summary())
        
        print("\n".join(report))
        self.speech_service.text_to_speech("Interview complete. Report generated.")

    def generate_summary(self):
        """Generate AI-powered summary"""
        history = "\n".join([f"Q: {q}\nA: {a[:200]}" for q, a, _ in self.conversation_history])
        
        prompt = f"""Create technical interview summary:
        {history}
        
        Job Requirements: {self.job_desc}
        
        Include:
        - Technical strengths
        - Key improvement areas
        - Recommended focus areas
        - Overall suitability
        
        Format: <Summary>Your summary</Summary>
        """
        
        response = self._generate_response(prompt, model_name='summary_generator', max_tokens=500)
        return self._extract_tag(response, "Summary") or "Comprehensive technical evaluation completed."

    def _get_difficulty_history(self):
        """Format difficulty progression"""
        return ' → '.join(
            ['Basic','Intermediate','Advanced'][entry[2]['difficulty_level']]
            for entry in self.conversation_history
        )

class AzureSpeechService:
    def __init__(self):
        self.speech_key = os.getenv("AZURE_SPEECH_KEY")
        self.service_region = os.getenv("AZURE_SERVICE_REGION")
        
        if not self.speech_key or not self.service_region:
            raise ValueError("Azure credentials missing")
            
        self.speech_config = speechsdk.SpeechConfig(
            subscription=self.speech_key,
            region=self.service_region
        )
        self.audio_config = speechsdk.audio.AudioConfig(
            use_default_microphone=True
        )

    def recognize_speech(self):
        """Convert speech to text"""
        try:
            recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=self.audio_config
            )
            result = recognizer.recognize_once_async().get()
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                return result.text.strip()
            return None
        except Exception as e:
            print(f"Speech error: {str(e)}")
            return None

    def text_to_speech(self, text):
        """Convert text to speech"""
        try:
            self.speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=self.speech_config
            )
            synthesizer.speak_text_async(text).get()
            return True
        except Exception as e:
            print(f"Speech error: {str(e)}")
            return False

if __name__ == "__main__":
    job_description = """Senior Python Engineer with:
    - 5+ years backend development
    - Expert in distributed systems
    - Cloud architecture experience (AWS)
    - Strong database design skills
    - Microservices and API design"""
    
    try:
        interview = MultiModelInterviewSystem(job_description)
        interview.conduct_interview()
    except Exception as e:
        print(f"Interview failed: {str(e)}")
