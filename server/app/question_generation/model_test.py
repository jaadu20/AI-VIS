from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch
import ast
import pyttsx3
import speech_recognition as sr
from typing import List, Dict

class TechnicalCodeInterviewSystem:
    def __init__(self, job_description: str):
        self.job_desc = job_description
        self.difficulty_levels = {
            'easy': {'concepts': ['syntax', 'basic DS', 'debugging'], 'code_length': 50},
            'medium': {'concepts': ['OOP', 'algorithms', 'optimization'], 'code_length': 100},
            'hard': {'concepts': ['complex DS', 'DP', 'system design'], 'code_length': 150}
        }
        self.current_difficulty = 'medium'
        self.question_count = 0
        self.history = []
        
        # Initialize FLAN-T5
        self.tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-large")
        self.model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-large")
        if torch.cuda.is_available():
            self.model = self.model.to("cuda")
        
        # Initialize Text-to-Speech engine
        self.tts_engine = pyttsx3.init()
        self.tts_engine.setProperty('rate', 150)  # Speed percent (can go over 100)
        self.tts_engine.setProperty('volume', 0.9)  # Volume 0-1

    def speak(self, text: str):
        """Convert text to speech."""
        self.tts_engine.say(text)
        self.tts_engine.runAndWait()

    def recognize_speech(self) -> str:
        """Recognize speech input from the user."""
        recognizer = sr.Recognizer()
        with sr.Microphone() as source:
            self.speak("Listening for your response...")
            audio = recognizer.listen(source)
        try:
            response = recognizer.recognize_google(audio)
            print(f"You said: {response}")
            return response
        except sr.UnknownValueError:
            self.speak("Sorry, I did not understand that.")
            return ""
        except sr.RequestError as e:
            self.speak(f"Could not request results; {e}")
            return ""

    def generate_question(self) -> Dict:
        """Generate a coding question with specific data structure focus."""
        prompt = f"""
        Create a Python coding question for {self.job_desc} with these requirements:
        - Difficulty: {self.current_difficulty}
        - Focus on: {self.difficulty_levels[self.current_difficulty]['concepts']}
        - Required data structure: {self._get_data_structure()}
        - Include common Python syntax errors to test debugging skills
        - Provide sample input/output
        Format as: {{"question": "...", "sample_code": "...", "test_cases": [...]}}

        Additionally, provide a technical question related to {self.job_desc} focusing on {self.difficulty_levels[self.current_difficulty]['concepts']}.
        """
        
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(**inputs, max_new_tokens=300)
        return self._parse_question(self.tokenizer.decode(outputs[0], skip_special_tokens=True))

    def analyze_code(self, question: Dict, user_code: str) -> Dict:
        """Analyze code for syntax, logic, and data structure usage."""
        analysis = {
            'syntax_errors': self._find_syntax_errors(user_code),
            'data_structure_usage': self._check_data_structure_usage(question, user_code),
            'test_results': self._run_test_cases(question, user_code),
            'code_quality': self._evaluate_code_quality(user_code)
        }
        return analysis

    def _find_syntax_errors(self, code: str) -> List[str]:
        """Validate Python syntax using AST."""
        try:
            ast.parse(code)
            return []
        except SyntaxError as e:
            return [f"Line {e.lineno}: {e.msg}"]

    def _check_data_structure_usage(self, question: Dict, code: str) -> str:
        """Verify required data structure is used properly."""
        data_structure = question.get('data_structure', 'the required data structure')
        prompt = f"""
        Does this Python code correctly implement/use {data_structure}?
        Code: {code}
        Answer yes or no with reason.
        """
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(**inputs, max_new_tokens=100)
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)

    def _run_test_cases(self, question: Dict, code: str) -> Dict:
        """Evaluate code against test cases (simulated)."""
        prompt = f"""
        Given Python code and test cases, return pass/fail results:
        Code: {code}
        Test Cases: {question['test_cases']}
        Output format: {{"passed": X, "failed": Y}}
        """
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(**inputs, max_new_tokens=100)
        return self._parse_test_results(self.tokenizer.decode(outputs[0], skip_special_tokens=True))

    def _evaluate_code_quality(self, code: str) -> str:
        """Evaluate code style and best practices."""
        prompt = f"""
        Analyze this Python code quality:
        - PEP8 compliance
        - Variable naming
        - Time/space complexity
        - Error handling
        Code: {code}
        Return assessment with letter grade (A-F)
        """
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(**inputs, max_new_tokens=100)
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)

    def _get_data_structure(self) -> str:
        """Select appropriate data structure based on difficulty."""
        structures = {
            'easy': ['list', 'dict', 'set'],
            'medium': ['heapq', 'deque', 'defaultdict'],
            'hard': ['trie', 'union-find', 'segment tree']
        }
        return structures[self.current_difficulty][self.question_count % 3]

    def _parse_question(self, raw_text: str) -> Dict:
        """Parse generated question into structured format."""
        try:
            return eval(raw_text)
        except:
            return {
                "question": raw_text,
                "sample_code": "# Generated code parsing failed",
                "test_cases": []
            }

    def _parse_test_results(self, raw_text: str) -> Dict:
        """Parse test results from model output."""
        try:
            return eval(raw_text)
        except:
            return {"passed": 0, "failed": 0}  # Simulated results
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch
import re
import ast
from typing import List, Dict

class TechnicalCodeInterviewSystem:
    def __init__(self, job_description: str):
        self.job_desc = job_description
        self.difficulty_levels = {
            'easy': {'concepts': ['syntax', 'basic DS', 'debugging'], 'code_length': 50},
            'medium': {'concepts': ['OOP', 'algorithms', 'optimization'], 'code_length': 100},
            'hard': {'concepts': ['complex DS', 'DP', 'system design'], 'code_length': 150}
        }
        self.current_difficulty = 'medium'
        self.question_count = 0
        self.history = []
        
        # Initialize FLAN-T5
        self.tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-large")
        self.model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-large")
        if torch.cuda.is_available():
            self.model = self.model.to("cuda")

    def generate_question(self) -> Dict:
        """Generate a coding question with specific data structure focus"""
        prompt = f"""
        Create a Python coding question for {self.job_desc} with these requirements:
        - Difficulty: {self.current_difficulty}
        - Focus on: {self.difficulty_levels[self.current_difficulty]['concepts']}
        - Required data structure: {self._get_data_structure()}
        - Include common Python syntax errors to test debugging skills
        - Provide sample input/output
        Format as: {{"question": "...", "sample_code": "...", "test_cases": [...]}}
        """
        
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(**inputs, max_new_tokens=300)
        return self._parse_question(self.tokenizer.decode(outputs[0], skip_special_tokens=True))

    def analyze_code(self, question: Dict, user_code: str) -> Dict:
        """Analyze code for syntax, logic, and data structure usage"""
        analysis = {
            'syntax_errors': self._find_syntax_errors(user_code),
            'data_structure_usage': self._check_data_structure_usage(question, user_code),
            'test_results': self._run_test_cases(question, user_code),
            'code_quality': self._evaluate_code_quality(user_code)
        }
        return analysis

    def _find_syntax_errors(self, code: str) -> List[str]:
        """Validate Python syntax using AST"""
        try:
            ast.parse(code)
            return []
        except SyntaxError as e:
            return [f"Line {e.lineno}: {e.msg}"]

    def _check_data_structure_usage(self, question: Dict, code: str) -> bool:
        """Verify required data structure is used properly"""
        prompt = f"""
        Does this Python code correctly implement/use {question.get('data_structure')}?
        Code: {code}
        Answer yes or no with reason.
        """
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(**inputs, max_new_tokens=100)
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)

    def _run_test_cases(self, question: Dict, code: str) -> Dict:
        """Evaluate code against test cases (simulated)"""
        prompt = f"""
        Given Python code and test cases, return pass/fail results:
        Code: {code}
        Test Cases: {question['test_cases']}
        Output format: {{"passed": X, "failed": Y}}
        """
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(**inputs, max_new_tokens=100)
        return self._parse_test_results(self.tokenizer.decode(outputs[0], skip_special_tokens=True))

    def _evaluate_code_quality(self, code: str) -> str:
        """Evaluate code style and best practices"""
        prompt = f"""
        Analyze this Python code quality:
        - PEP8 compliance
        - Variable naming
        - Time/space complexity
        - Error handling
        Code: {code}
        Return assessment with letter grade (A-F)
        """
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(**inputs, max_new_tokens=100)
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)

    def _get_data_structure(self) -> str:
        """Select appropriate data structure based on difficulty"""
        structures = {
            'easy': ['list', 'dict', 'set'],
            'medium': ['heapq', 'deque', 'defaultdict'],
            'hard': ['trie', 'union-find', 'segment tree']
        }
        return structures[self.current_difficulty][self.question_count % 3]

    def _parse_question(self, raw_text: str) -> Dict:
        """Parse generated question into structured format"""
        try:
            return eval(raw_text)
        except:
            return {
                "question": raw_text,
                "sample_code": "# Generated code parsing failed",
                "test_cases": []
            }

    def _parse_test_results(self, raw_text: str) -> Dict:
        """Parse test results from model output"""
        return {"passed": 0, "failed": 0}  # Simulated results

    def conduct_interview(self):
        print(f"Python Coding Interview for: {self.job_desc}")
        try:
            while self.question_count < 10:
                question = self.generate_question()
                print(f"\nQuestion {self.question_count+1}: {question['question']}")
                print(f"\nSample Code:\n{question['sample_code']}")
                
                user_code = input("\nYour Python code:\n")
                analysis = self.analyze_code(question, user_code)
                
                print(f"\nAnalysis:")
                print(f"Syntax Errors: {analysis['syntax_errors']}")
                print(f"Data Structure Usage: {analysis['data_structure_usage']}")
                print(f"Code Quality: {analysis['code_quality']}")
                
                self.question_count += 1
                self._adjust_difficulty(analysis)
                
        except KeyboardInterrupt:
            print("\nInterview session ended early.")
        
        print("\nFinal Technical Assessment:")
        self._generate_final_report()

    def _adjust_difficulty(self, analysis: Dict):
        """Adjust difficulty based on performance"""
        if 'A' in analysis['code_quality'] and not analysis['syntax_errors']:
            self.current_difficulty = 'hard' if self.current_difficulty == 'medium' else 'hard'
        elif analysis['syntax_errors'] or 'D' in analysis['code_quality']:
            self.current_difficulty = 'easy'

    def _generate_final_report(self):
        """Generate comprehensive technical report"""
        prompt = f"""
        Generate final technical report for Python developer interview:
        Performance History: {self.history}
        Required Skills: {self.job_desc}
        Include:
        - Syntax accuracy
        - Data structure mastery
        - Code quality trends
        - Improvement recommendations
        - Final score (0-100)
        """
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(**inputs, max_new_tokens=400)
        print(self.tokenizer.decode(outputs[0], skip_special_tokens=True))

if __name__ == "__main__":
    job_description = "Python Developer with strong data structures and algorithms knowledge"
    interview = TechnicalCodeInterviewSystem(job_description)
    interview.conduct_interview()
