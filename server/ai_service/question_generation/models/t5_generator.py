from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch

class T5QuestionGenerator:
    def __init__(self, model_name="t5-base"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = T5Tokenizer.from_pretrained(model_name)
        self.model = T5ForConditionalGeneration.from_pretrained(model_name).to(self.device)
        
    def generate(self, context: str, num_questions=3):
        input_text = f"generate interview questions: {context}"
        input_ids = self.tokenizer.encode(input_text, return_tensors="pt").to(self.device)
        
        outputs = self.model.generate(
            input_ids,
            max_length=512,
            num_return_sequences=num_questions,
            num_beams=5,
            early_stopping=True
        )
        
        return [self.tokenizer.decode(output, skip_special_tokens=True) for output in outputs]