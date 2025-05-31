import requests
import json
from typing import Optional

class GroqQuestionGenerator:
    """A class to generate questions using the Groq API."""
    
    def __init__(self, api_key: str):
        """
        Initialize the Groq Question Generator.
        
        Args:
            api_key: Groq API key.
        """
        self.api_key = api_key
        if not self.api_key:
            raise ValueError("Groq API key is required.")
        
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def generate_question(self, topic: str, difficulty: str = "medium", question_type: str = "open-ended") -> str:
        """
        Generate a question on a specific topic.
        
        Args:
            topic: The subject area for the question
            difficulty: The difficulty level (easy, medium, hard)
            question_type: Type of question (multiple-choice, open-ended, true-false)
            
        Returns:
            A generated question as a string
        """
        prompt = self._create_prompt(topic, difficulty, question_type)
        
        payload = {
            "model": "llama3-70b-8192",  # You can change to other Groq models
            "messages": [
                {"role": "system", "content": "You are a helpful educational assistant that generates thoughtful questions."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 300
        }
        
        try:
            response = requests.post(self.api_url, headers=self.headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            question = result["choices"][0]["message"]["content"].strip()
            return question
            
        except requests.exceptions.RequestException as e:
            return f"Error generating question: {str(e)}"
    
    def _create_prompt(self, topic: str, difficulty: str, question_type: str) -> str:
        """Create a prompt for the Groq API based on parameters."""
        return f"""
        Generate a {difficulty} {question_type} question about {topic}.
        
        The question should be:
        - Clear and concise
        - Thought-provoking
        - Appropriate for {difficulty} difficulty level
        - Formatted as a {question_type} question
        
        Return only the question itself without any additional text or explanations.
        """

    def generate_quiz(self, topic: str, num_questions: int = 5, varying_difficulty: bool = True) -> list:
        """
        Generate a quiz with multiple questions on a topic.
        
        Args:
            topic: The subject area for the questions
            num_questions: Number of questions to generate
            varying_difficulty: Whether to vary difficulty levels
            
        Returns:
            A list of generated questions
        """
        difficulties = ["easy", "medium", "hard"]
        question_types = ["multiple-choice", "open-ended", "true-false"]
        
        quiz = []
        for i in range(num_questions):
            if varying_difficulty:
                difficulty = difficulties[i % len(difficulties)]
                q_type = question_types[i % len(question_types)]
            else:
                difficulty = "medium"
                q_type = "open-ended"
                
            question = self.generate_question(topic, difficulty, q_type)
            quiz.append({
                "question_number": i + 1,
                "question": question,
                "difficulty": difficulty,
                "type": q_type
            })
            
        return quiz


# Example usage
if __name__ == "__main__":
    # Directly provide your API key here
    API_KEY = "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"  # Replace with your actual Groq API key
    
    generator = GroqQuestionGenerator(api_key=API_KEY)
    
    # Generate a single question
    question = generator.generate_question(
        topic="machine learning", 
        difficulty="hard",
        question_type="open-ended"
    )
    print("Generated Question:", question)
    
    # Generate a quiz
    print("\nGenerating...")
    quiz = generator.generate_quiz(topic="Python programming", num_questions=3)
    
    # Print the quiz
    for q in quiz:
        print(f"\nQuestion {q['question_number']} ({q['difficulty']}, {q['type']}):")
        print(q['question'])