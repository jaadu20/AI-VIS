import os
import random
import torch
import re
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AzureSpeechService:
    def __init__(self):
        self.speech_key = os.getenv("AZURE_SPEECH_KEY")
        self.service_region = os.getenv("AZURE_SERVICE_REGION")
        
        if not self.speech_key or not self.service_region:
            raise ValueError("Azure credentials missing in .env file")
            
        self.speech_config = speechsdk.SpeechConfig(
            subscription=self.speech_key,
            region=self.service_region
        )
        self.audio_config = speechsdk.audio.AudioConfig(
            use_default_microphone=True
        )
        
    def text_to_speech(self, text):
        """Convert text to natural sounding speech"""
        self.speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=self.speech_config
        )
        return synthesizer.speak_text_async(text).get()

    def speech_to_text(self, prompt=None):
        """Convert spoken response to text"""
        recognizer = speechsdk.SpeechRecognizer(
            speech_config=self.speech_config,
            audio_config=self.audio_config
        )
        if prompt:
            self.text_to_speech(prompt)
        return recognizer.recognize_once_async().get()

class TechnicalInterviewSystem:
    def __init__(self, job_description):
        self.job_desc = job_description
        self.speech_service = AzureSpeechService()
        self.question_count = 0
        self.difficulty = "medium"
        self.history = []
        
        # Initialize AI components
        self.tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-large")
        self.model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-large")
        if torch.cuda.is_available():
            self.model = self.model.to("cuda")
            
        # Technical configuration
        self.tech_focus = self._analyze_job_description()
        self.question_bank = self._initialize_question_bank()

    def _analyze_job_description(self):
        """Extract key technical areas from job description"""
        focus_areas = []
        keywords = {
            'python': ['python', 'django', 'flask'],
            'debugging': ['debug', 'troubleshoot', 'fix'],
            'data_structures': ['algorithm', 'structure', 'optimize']
        }
        for area in keywords:
            if any(kw in self.job_desc.lower() for kw in keywords[area]):
                focus_areas.append(area)
        return focus_areas or ['python']

    def _initialize_question_bank(self):
        """Predefined technical questions with code samples"""
        return {
            'python': [
                "Explain the difference between @staticmethod and @classmethod in Python",
                "How would you implement a context manager in Python?",
                "What is the Global Interpreter Lock and how does it affect multithreading?"
            ],
            'debugging': [
                "Debug this code: [CODE]def add(a,b):\n    return a + b\nprint(add('5', 3))[/CODE]",
                "Identify issues in: [CODE]x = [1,2,3]\ny = x.append(4)\nprint(y)[/CODE]"
            ],
            'data_structures': [
                "Implement a LRU cache in Python",
                "How would you detect a cycle in a linked list?",
                "Explain time complexity of DFS vs BFS"
            ]
        }

    def generate_question(self):
        """Generate adaptive technical question"""
        # Select question type based on focus areas
        q_type = random.choice(self.tech_focus)
        base_question = random.choice(self.question_bank[q_type])
        
        # Format code questions
        if '[CODE]' in base_question:
            parts = base_question.split('[CODE]')
            question = parts[0] + "\n[Code Displayed on Screen]"
            code = parts[1].split('[/CODE]')[0]
            return question, code
        return base_question, None

    def analyze_answer(self, question, answer):
        """Evaluate technical answer quality"""
        prompt = f"""
        Analyze this technical interview response:
        Question: {question}
        Answer: {answer}
        
        Provide:
        1. Technical accuracy score (0-10)
        2. Key missing concepts
        3. Difficulty adjustment (easier/same/harder)
        
        Format: Score: X/10 | Missing: [...] | Adjustment: [...]
        """
        
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(
            inputs.input_ids,
            max_new_tokens=150,
            temperature=0.3
        )
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)

    def conduct_interview(self):
        """Main interview flow with voice interaction"""
        try:
            self.speech_service.text_to_speech(
                f"Starting technical interview for {self.job_desc}. "
                f"We will ask {10-self.question_count} questions. "
                "Please wait while we initialize the system."
            )
            
            while self.question_count < 10:
                # Generate and ask question
                question, code = self.generate_question()
                self._present_question(question, code)
                
                # Capture and process answer
                answer = self._get_answer()
                analysis = self.analyze_answer(question, answer)
                
                # Update interview state
                self._update_difficulty(analysis)
                self.question_count += 1
                self.history.append((question, answer, analysis))
                
                # Provide feedback
                self._give_feedback(analysis)
                
            self._generate_final_report()
            
        except Exception as e:
            self.speech_service.text_to_speech("Interview session encountered an error")
            print(f"Error: {str(e)}")

    def _present_question(self, question, code):
        """Present question through voice and visual channels"""
        # Voice presentation
        self.speech_service.text_to_speech(f"Question {self.question_count+1}: {question}")
        
        # Visual presentation
        print(f"\n{'='*40}")
        print(f"Question {self.question_count+1}: {question}")
        if code:
            print(f"\nCode:\n{code}")
        print("Waiting for your answer...")

    def _get_answer(self):
        """Capture spoken answer with retry logic"""
        for _ in range(3):
            result = self.speech_service.speech_to_text("Please speak your answer now")
            
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                return result.text
            elif result.reason == speechsdk.ResultReason.NoMatch:
                self.speech_service.text_to_speech("I didn't hear your response. Please try again")
            else:
                self.speech_service.text_to_speech("There was an error with the microphone. Please try again")
        return "No answer recorded"

    def _update_difficulty(self, analysis):
        """Adjust question difficulty dynamically"""
        if "Adjustment: harder" in analysis:
            self.difficulty = "hard"
        elif "Adjustment: easier" in analysis:
            self.difficulty = "easy"

    def _give_feedback(self, analysis):
        """Provide immediate verbal feedback"""
        if "Score: 8" in analysis or "Score: 9" in analysis or "Score: 10" in analysis:
            self.speech_service.text_to_speech("Excellent answer!")
        elif "Score: 5" in analysis or "Score: 6" in analysis or "Score: 7" in analysis:
            self.speech_service.text_to_speech("Good attempt, but could use more detail")
        else:
            self.speech_service.text_to_speech("Let's try another question on this topic")

    def _generate_final_report(self):
        """Generate comprehensive evaluation report"""
        report = ["Technical Interview Report:", f"Position: {self.job_desc}"]
        
        # Calculate scores
        scores = [int(re.search(r"Score: (\d+)", a).group(1)) for _,_,a in self.history]
        report.append(f"Average Score: {sum(scores)/len(scores):.1f}/10")
        
        # Identify weaknesses
        weaknesses = set()
        for _,_,a in self.history:
            if missing := re.search(r"Missing: \[(.*?)\]", a):
                weaknesses.update(missing.group(1).split(', '))
        if weaknesses:
            report.append("Key Areas for Improvement:\n- " + "\n- ".join(weaknesses))
        
        # Print and speak summary
        print("\n".join(report))
        self.speech_service.text_to_speech(
            f"Interview complete. Your average score was {sum(scores)/len(scores):.1f} out of 10. "
            "A detailed report has been generated."
        )

if __name__ == "__main__":
    # Configuration
    job_description = "Python Developer with strong debugging and data structures skills"
    
    try:
        interview = TechnicalInterviewSystem(job_description)
        interview.conduct_interview()
    except Exception as e:
        print(f"Failed to start interview: {str(e)}")