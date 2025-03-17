from transformers import pipeline

class AnswerEvaluator:
    def __init__(self):
        self.model = pipeline(
            "text-classification",
            model="distilbert-base-uncased",
            tokenizer="distilbert-base-uncased"
        )
    
    def evaluate(self, question: str, answer: str) -> float:
        result = self.model(f"{question} [SEP] {answer}")[0]
        return round(result['score'] * 10, 1)
    
    def adjust_difficulty(self, scores: list) -> str:
        avg_score = sum(scores) / len(scores)
        if avg_score < 4: return "easy"
        elif avg_score < 7: return "medium"
        return "hard"