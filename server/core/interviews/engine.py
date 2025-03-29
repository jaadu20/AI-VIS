# interview_engine.py
from transformers import pipeline
import numpy as np

class AIVisInterviewEngine:
    def __init__(self, job_id):
        self.job = Job.objects.get(id=job_id)
        self.llama_generator = pipeline("text-generation", 
                                      model="meta-llama/Meta-Llama-3-70B",
                                      device=0)  # Use GPU
        
        self.answer_analyzer = pipeline(
            "text-classification",
            model="bert-base-uncased",
            return_all_scores=True
        )
        
        self.difficulty_level = "medium"
        self.context_history = []

    def generate_initial_questions(self):
        return [
            "Tell me about yourself",
            "Why are you interested in this position?",
            "What relevant experience do you have?"
        ]

    def generate_adaptive_question(self):
        prompt = f"""
        Generate a {self.difficulty_level} difficulty interview question 
        for a {self.job.title} position.
        Job Requirements: {self.job.description[:500]}
        Previous Context: {self.context_history[-3:]}
        """
        
        question = self.llama_generator(
            prompt,
            max_length=100,
            do_sample=True,
            temperature=0.7
        )[0]['generated_text']
        
        return question.strip()

    def analyze_answer(self, answer_text):
        # NLP Analysis
        analysis = self.answer_analyzer({
            'text': answer_text,
            'text_pair': self.job.description
        })
        
        # Calculate relevance score (0-10)
        relevance_score = np.mean([s['score'] for s in analysis if s['label'] == 'LABEL_1']) * 10
        
        # Update difficulty based on performance
        if relevance_score > 7:
            self.difficulty_level = "hard"
        elif relevance_score > 4:
            self.difficulty_level = "medium"
        else:
            self.difficulty_level = "easy"
            
        return relevance_score

    def process_interview_step(self, session_id, answer_data):
        session = InterviewSession.objects.get(id=session_id)
        
        # 1. Save previous answer
        prev_question = InterviewQuestion.objects.get(
            session=session,
            order=session.current_question
        )
        
        answer = CandidateAnswer.objects.create(
            question=prev_question,
            transcript=answer_data['text'],
            audio_path=answer_data['audio_path'],
            video_path=answer_data['video_path'],
            nlp_score=self.analyze_answer(answer_data['text']),
            voice_score=analyze_voice_tone(answer_data['audio_path']),
            facial_score=analyze_facial_expression(answer_data['video_path'])
        )
        
        # 2. Generate next question
        if session.current_question < 3:  # First 3 basic questions
            next_question_text = self.generate_initial_questions()[session.current_question]
            question_type = "basic"
        else:
            next_question_text = self.generate_adaptive_question()
            question_type = "adaptive"
        
        # 3. Save new question
        new_question = InterviewQuestion.objects.create(
            session=session,
            text=next_question_text,
            question_type=question_type,
            difficulty=self.difficulty_level,
            order=session.current_question + 1
        )
        
        # 4. Update session
        session.current_question += 1
        if session.current_question >= 12:  # Total questions
            session.status = "completed"
            calculate_final_score(session.id)
        session.save()
        
        return {
            "next_question": new_question.text,
            "question_number": new_question.order,
            "difficulty": new_question.difficulty
        }