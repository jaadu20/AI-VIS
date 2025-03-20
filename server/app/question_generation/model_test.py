from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch
import re

class TechnicalInterviewSystem:
    def __init__(self, job_description):
        self.job_desc = job_description
        self.difficulty = "medium"
        self.question_count = 0
        self.history = []
        self.technical_areas = self._extract_technical_areas()
        
        # Initialize FLAN-T5
        self.tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-large")
        self.model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-large")
        if torch.cuda.is_available():
            self.model = self.model.to("cuda")

    def _extract_technical_areas(self):
        """Identify key technical areas from job description"""
        areas = []
        keywords = {
            'Django': ['ORM', 'middleware', 'authentication', 'REST framework', 'migrations'],
            'Database': ['optimization', 'indexing', 'transactions', 'scaling', 'normalization'],
            'Python': ['decorators', 'concurrency', 'memory management', 'type hints', 'async/await']
        }
        
        for tech in keywords:
            if tech.lower() in self.job_desc.lower():
                areas.extend(keywords[tech])
        return list(set(areas))[:3]  # Keep top 3 areas

    def generate_question(self):
        """Generate job-specific technical question"""
        prompt = f"""
        Generate a {self.difficulty} difficulty technical interview question for {self.job_desc}.
        Focus specifically on {self.technical_areas}.
        The question should test practical implementation knowledge.
        Include scenario-based problem solving.
        Require understanding of best practices in {self.job_desc.split(' ')[0]} development.
        """
        
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=200,
            temperature=0.7,
            do_sample=True,
            repetition_penalty=1.5
        )
        
        question = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        self.question_count += 1
        return question

    def analyze_answer(self, question, answer):
        """Technical answer analysis with skill gap identification"""
        analysis_prompt = f"""
        Analyze this technical answer for a {self.job_desc} position:
        Question: {question}
        Answer: {answer}
        
        Evaluate:
        1. Technical accuracy (0-10)
        2. Missing key concepts from: {self.technical_areas}
        3. Code quality/best practices
        4. Suggested difficulty adjustment (easier/same/harder)
        
        Format: 
        Score: X/10 | Missing: [concepts] | Adjustment: [difficulty]
        """
        
        inputs = self.tokenizer(analysis_prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=150,
            temperature=0.3
        )
        
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)

    def adjust_difficulty(self, analysis):
        """More sophisticated difficulty adjustment"""
        match = re.search(r"Adjustment: (\w+).*Missing: \[(.*?)\]", analysis)
        if match:
            new_diff = match.group(1).lower()
            missing_concepts = match.group(2).split(', ')
            
            # Update technical areas to focus on weaknesses
            if missing_concepts:
                self.technical_areas = list(set(self.technical_areas + missing_concepts))[:3]
            
            # Adjust difficulty based on both score and missing concepts
            if new_diff == "harder" and self.difficulty != "hard":
                self.difficulty = "hard"
            elif new_diff == "easier" and self.difficulty != "easy":
                self.difficulty = "easy"

    def conduct_interview(self):
        print(f"Starting technical interview for: {self.job_desc}")
        print(f"Focus areas: {', '.join(self.technical_areas)}\n")
        try:
            while self.question_count < 10:
                question = self.generate_question()
                print(f"\n[Q{self.question_count}] {question}")
                answer = input("Your technical answer: ")
                self.history.append((question, answer))
                
                analysis = self.analyze_answer(question, answer)
                print(f"\n[Analysis] {analysis}")
                self.adjust_difficulty(analysis)
                
        except KeyboardInterrupt:
            print("\nInterview session ended early.")
        
        print("\nTechnical Evaluation Report:")
        self.generate_feedback()

    def generate_feedback(self):
        """Detailed technical feedback report"""
        feedback_prompt = f"""
        Generate detailed technical feedback for a {self.job_desc} candidate:
        Interview History: {self.history}
        Technical Focus Areas: {self.technical_areas}
        
        Include:
        1. Technical strengths/weaknesses
        2. Skill gaps in {', '.join(self.technical_areas)}
        3. Recommended learning resources
        4. Overall technical competency score (0-100)
        """
        
        inputs = self.tokenizer(feedback_prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(**inputs, max_new_tokens=400)
        print(self.tokenizer.decode(outputs[0], skip_special_tokens=True))

if __name__ == "__main__":
    job_description = "Python Developer with Django and Database optimization experience"
    interview = TechnicalInterviewSystem(job_description)
    interview.conduct_interview()