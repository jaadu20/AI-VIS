# services/llm_service.py
from transformers import AutoTokenizer, AutoModelForCausalLM
from huggingface_hub import login
import torch
import re
from typing import List
from django.conf import settings

class LLMService:
    def __init__(self):
        login(token=settings.HUGGINGFACE_TOKEN)
        self.model_id = "meta-llama/Llama-3.1-8B"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_id)
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_id,
            torch_dtype=torch.float16,
            device_map="auto",
            attn_implementation="sdpa"
        )
    
    def get_difficulty_prompt(self, difficulty: str, job_description: str) -> str:
        """Generate prompts based on difficulty level"""
        base_context = f"Job Description: {job_description}"
        
        if difficulty == "easy":
            return f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are conducting a technical interview. Generate 1 EASY-level interview question based on the following job description. 
The question should be fundamental, basic concepts that any entry-level candidate should know.
Focus on basic terminology, simple concepts, or general knowledge about the role.

{base_context}

Return ONLY the question without numbering or additional text.<|eot_id|>

<|start_header_id|>assistant<|end_header_id|>"""
        
        elif difficulty == "medium":
            return f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are conducting a technical interview. Generate 1 MEDIUM-level interview question based on the following job description.
The question should require practical knowledge, some experience, and understanding of concepts beyond basics.
Focus on problem-solving, practical applications, or intermediate technical concepts.

{base_context}

Return ONLY the question without numbering or additional text.<|eot_id|>

<|start_header_id|>assistant<|end_header_id|>"""
        
        else:  # hard
            return f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are conducting a technical interview. Generate 1 HARD-level interview question based on the following job description.
The question should be challenging, require deep understanding, advanced concepts, or complex problem-solving.
Focus on system design, optimization, advanced algorithms, or expert-level scenarios.

{base_context}

Return ONLY the question without numbering or additional text.<|eot_id|>

<|start_header_id|>assistant<|end_header_id|>"""
    
    def generate_question(self, job_description: str, difficulty: str = "easy") -> str:
        """Generate a single interview question based on job description and difficulty"""
        prompt = self.get_difficulty_prompt(difficulty, job_description)
        
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=150,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                num_return_sequences=1,
                pad_token_id=self.tokenizer.eos_token_id,
                eos_token_id=self.tokenizer.eos_token_id
            )
        
        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        # Extract only the generated question part
        question = generated_text.split("<|start_header_id|>assistant<|end_header_id|>")[-1].strip()
        
        # Clean up the question
        question = re.sub(r'^\d+\.\s*', '', question)  # Remove numbering
        question = question.split('\n')[0].strip()  # Take first line only
        
        return question if question else "Tell me about your experience with this role."