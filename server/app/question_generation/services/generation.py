from ..models.t5_generator import T5QuestionGenerator

class QuestionService:
    def __init__(self):
        self.generator = T5QuestionGenerator()
        
    def get_initial_questions(self, request):
        return self.generator.generate(request.job_description, request.num_questions)
        
    def get_followup_question(self, request):
        context = f"""
        Job: {request.job_description}
        Previous Q&A: {list(zip(request.previous_questions, request.answers))}
        """
        return self.generator.generate(context, 1)[0]