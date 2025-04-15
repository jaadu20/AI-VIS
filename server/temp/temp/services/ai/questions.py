from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

class QuestionGenerator:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B")
        self.model = AutoModelForCausalLM.from_pretrained(
            "meta-llama/Llama-3.1-8B",
            torch_dtype=torch.float16,
            device_map="auto"
        )
    
    def generate(self, job_desc: str, previous_answer: str = "", difficulty: str = "medium"):
        prompt = f"""
        Generate interview question for position: {job_desc}
        Previous answer context: {previous_answer}
        Difficulty level: {difficulty}
        Generate one technical question:
        """
        
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(
            inputs.input_ids,
            max_new_tokens=100,
            temperature=0.7,
            top_p=0.9
        )
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True).replace(prompt, "")