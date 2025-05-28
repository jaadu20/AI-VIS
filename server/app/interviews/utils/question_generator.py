from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from django.conf import settings

class QuestionGenerator:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained(settings.LLM_MODEL_ID)
        self.model = AutoModelForCausalLM.from_pretrained(
            settings.LLM_MODEL_ID,
            torch_dtype=torch.float16,
            device_map="auto",
            attn_implementation="sdpa"
        )
    
    def generate_question(self, job_description, difficulty='easy'):
        """Generate interview question based on job description and difficulty"""
        prompts = {
            'easy': "Generate an easy-level interview question about basic concepts related to:",
            'medium': "Create a medium-difficulty technical interview question about:",
            'hard': "Formulate a challenging, in-depth interview question for an expert in:"
        }
        
        prompt = f"""
        <|begin_of_text|><|start_header_id|>system<|end_header_id|>
        You are a technical interviewer creating questions for a job position.
        {prompts[difficulty]} {job_description}
        Return ONLY the question without any additional commentary.<|eot_id|>
        <|start_header_id|>assistant<|end_header_id|>
        """
        
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=100,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=self.tokenizer.eos_token_id
        )
        
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True).replace(prompt, "").strip()