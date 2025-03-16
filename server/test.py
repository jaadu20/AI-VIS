from app.question_generation.models.t5_generator import QuestionGenerator

def test_questions():
    print("\nTesting question generation...")
    qg = QuestionGenerator()
    questions = qg.generate("Python developer with Django experience", 3)
    print("Generated Questions:")
    for i, question in enumerate(questions, 1):
        print(f"{i}. {question}")

if __name__ == "__main__":
    test_questions()