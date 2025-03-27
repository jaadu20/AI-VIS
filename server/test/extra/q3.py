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

        # Initialize multiple models with error handling
        self.models = {
            'question_generator': self._load_model("deepseek-ai/deepseek-coder-6.7b-instruct"),
            'answer_analyzer': self._load_model("tiiuae/falcon-7b-instruct"),
            'summary_generator': self._load_model("HuggingFaceH4/zephyr-7b-beta")
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
        """Extract focus areas using the question generator model"""
        prompt = f"""Extract technical focus areas from job description:
        {self.job_desc}
        
        Return comma-separated list of 3-5 core competencies.
        Format: <FocusAreas>area1, area2, area3</FocusAreas>
        """
        
        response = self._generate_response(
            prompt=prompt,
            model_name='question_generator',
            max_tokens=100
        )
        
        areas = re.search(r"<FocusAreas>(.*?)</FocusAreas>", response)
        return areas.group(1).split(', ') if areas else ["Python Programming"]

    def _generate_response(self, prompt, model_name='question_generator', **kwargs):
        """Generic generation method with model selection"""
        model_config = self.models.get(model_name)
        if not model_config:
            return ""

        try:
            inputs = model_config['tokenizer'](
                prompt,
                return_tensors="pt",
                return_attention_mask=True,
                padding=True,
                truncation=True
            ).to(model_config['model'].device)

            outputs = model_config['model'].generate(
                inputs.input_ids,
                attention_mask=inputs.attention_mask,
                max_new_tokens=kwargs.get('max_tokens', 256),
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
        """Helper to extract XML-like tag content"""
        match = re.search(rf"<{tag_name}>(.*?)</{tag_name}>", text, re.DOTALL)
        return match.group(1).strip() if match else None

    def generate_question(self):
        """Generate context-aware question"""
        if not self.conversation_history:
            return self._generate_opening_question()
        return self._generate_follow_up_question()

    def _generate_opening_question(self):
        """Generate first question using primary model"""
        prompt = f"""Generate opening technical question for {self.job_desc}.
        Focus on: {self.current_focus_areas[0]}
        Difficulty: {['easy','medium','hard'][self.difficulty_level]}
        
        Format: <Question>Your question</Question>
        """
        
        response = self._generate_response(
            prompt=prompt,
            model_name='question_generator'
        )
        return self._extract_tag(response, "Question") or "Explain your approach to system design."

    def _generate_follow_up_question(self):
        """Generate follow-up question based on conversation history"""
        last_qa = self.conversation_history[-1]
        history = "\n".join([f"Q{i+1}: {q}\nA: {a[:200]}" for i, (q, a, _) in enumerate(self.conversation_history[-3:])])

        prompt = f"""Generate technical follow-up question based on:
        {history}

        Current focus: {', '.join(self.current_focus_areas)}
        Knowledge gaps: {', '.join(self.knowledge_gaps[-3:]) or 'None'}
        Difficulty: {['easy','medium','hard'][self.difficulty_level]}
        
        The question should:
        1. Address recent answer weaknesses
        2. Probe deeper into mentioned concepts
        3. Maintain technical continuity
        
        Format: <Question>Your question</Question><Focus>Technical area</Focus>"""
        
        response = self._generate_response(
            prompt=prompt,
            model_name='question_generator',
            max_tokens=300
        )
        
        question = self._extract_tag(response, "Question")
        focus = self._extract_tag(response, "Focus")

        if focus and focus not in self.current_focus_areas:
            self.current_focus_areas.append(focus)

        return question or "Could you elaborate on that concept in more technical detail?"

    def analyze_answer(self, question, answer):
        """Analyze answer using specialized model"""
        prompt = f"""Analyze this technical Q&A pair:
        Q: {question}
        A: {answer}

        Provide:
        1. Technical weaknesses (comma-separated)
        2. Difficulty adjustment (-1, 0, +1)
        3. New focus areas to explore
        
        Format:
        <Weaknesses>item1, item2</Weaknesses>
        <DifficultyAdjust>number</DifficultyAdjust>
        <NextFocus>area1, area2</NextFocus>"""
        
        response = self._generate_response(
            prompt=prompt,
            model_name='answer_analyzer',
            temperature=0.3,
            max_tokens=200
        )
        
        weaknesses = self._extract_tag(response, "Weaknesses")
        try:
            adj = int(self._extract_tag(response, "DifficultyAdjust") or 0)
        except ValueError:
            adj = 0
        new_focus = self._extract_tag(response, "NextFocus")

        # Update state
        if weaknesses:
            self.knowledge_gaps.extend([w.strip() for w in weaknesses.split(',')])
        
        self.difficulty_level = max(0, min(2, self.difficulty_level + adj))
        
        if new_focus:
            self.current_focus_areas = list(set(self.current_focus_areas + new_focus.split(', ')))

        return {
            'weaknesses': weaknesses.split(', ') if weaknesses else [],
            'difficulty': ['easy','medium','hard'][self.difficulty_level],
            'new_focus': new_focus.split(', ') if new_focus else []
        }

    def conduct_interview(self):
        """Execute the complete interview flow"""
        try:
            self.speech_service.text_to_speech(f"Starting interview for {self.job_desc}")
            current_question = self.generate_question()
            
            while len(self.conversation_history) < 10:
                # Ask question
                self.speech_service.text_to_speech(current_question)
                print(f"\n[Q{len(self.conversation_history)+1}] {current_question}")

                # Get answer
                answer = None
                while not answer:
                    answer = self.speech_service.recognize_speech()
                    if not answer:
                        self.speech_service.text_to_speech("Could you please repeat that?")
                print(f"Answer: {answer}")

                # Analyze response
                analysis = self.analyze_answer(current_question, answer)
                self.conversation_history.append((current_question, answer, analysis))

                # Generate next question
                current_question = self.generate_question()

                # Provide feedback
                feedback = self._generate_feedback(analysis)
                if feedback:
                    self.speech_service.text_to_speech(feedback)

            self._generate_final_report()

        except Exception as e:
            self.speech_service.text_to_speech("Interview session ended unexpectedly")
            print(f"Error: {str(e)}")

    def _generate_feedback(self, analysis):
        """Generate verbal feedback based on analysis"""
        feedback = []
        if analysis['weaknesses']:
            feedback.append(f"Let's explore {analysis['weaknesses'][0]} further.")
        if self.difficulty_level > 1:
            feedback.append("Increasing question complexity.")
        return " ".join(feedback) if feedback else None

    def _generate_final_report(self):
        """Generate end-of-interview summary"""
        report = ["\nInterview Summary", "="*40]
        for idx, (q, a, analysis) in enumerate(self.conversation_history):
            report.append(f"\nQ{idx+1} ({analysis['difficulty']}): {q}")
            report.append(f"Answer: {a[:100]}...")
            report.append(f"Focus Areas: {', '.join(analysis['new_focus'])}")
            report.append(f"Weaknesses: {', '.join(analysis['weaknesses'])}")
        
        # Generate AI summary
        summary = self.generate_summary()
        report.append("\nFinal Assessment:\n" + summary)
        
        self.speech_service.text_to_speech("Interview complete. Generating final report.")
        print("\n".join(report))

    def generate_summary(self):
        """Generate final summary using dedicated model"""
        history = "\n".join([f"Q: {q}\nA: {a}" for q, a, _ in self.conversation_history])
        
        prompt = f"""Generate interview summary based on:
        {history}
        
        Job description: {self.job_desc}
        Format: <Summary>Your summary</Summary>
        """
        
        response = self._generate_response(
            prompt=prompt,
            model_name='summary_generator',
            max_tokens=400
        )
        return self._extract_tag(response, "Summary") or "Comprehensive technical interview conducted."

class AzureSpeechService:
    def __init__(self):
        self.speech_key = os.getenv("AZURE_SPEECH_KEY")
        self.service_region = os.getenv("AZURE_SERVICE_REGION")
        
        if not self.speech_key or not self.service_region:
            raise ValueError("Azure credentials missing in environment variables")
            
        self.speech_config = speechsdk.SpeechConfig(
            subscription=self.speech_key,
            region=self.service_region
        )
        self.audio_config = speechsdk.audio.AudioConfig(
            use_default_microphone=True
        )

    def recognize_speech(self):
        """Convert speech to text with error handling"""
        try:
            recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=self.audio_config
            )
            result = recognizer.recognize_once_async().get()
            return result.text.strip() if result.reason == speechsdk.ResultReason.RecognizedSpeech else None
        except Exception as e:
            print(f"Speech recognition error: {str(e)}")
            return None

    def text_to_speech(self, text):
        """Convert text to speech with error handling"""
        try:
            self.speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=self.speech_config
            )
            synthesizer.speak_text_async(text).get()
            return True
        except Exception as e:
            print(f"Speech synthesis error: {str(e)}")
            return False

if __name__ == "__main__":
    job_description = "Senior Python Engineer with distributed systems experience"
    try:
        interview = MultiModelInterviewSystem(job_description)
        interview.conduct_interview()
    except Exception as e:
        print(f"Interview failed: {str(e)}")