from transformers import AutoTokenizer, AutoModelForCausalLM, AutoModelForSequenceClassification
import torch
from huggingface_hub import login



class AIService:
    _instance = None
    
    def __new__(cls):
        if not cls._instance:
            cls._instance = super().__new__(cls)
            cls._instance.initialize_models()
        return cls._instance
    
    def initialize_models(self):
        # Llama-3.1-8B model
        login(token="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")
        model_id = "meta-llama/Llama-3.1-8B"
        model = AutoModelForCausalLM.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            device_map="auto",
            attn_implementation="eager") 
        self.llama_model = AutoModelForCausalLM.from_pretrained(
            model_id,
            torch_dtype=torch.bfloat16,
            device_map="auto"
        )
        
        # Answer scoring model
        self.scoring_tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
        self.scoring_model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased")

    def generate_question(self, context, difficulty):
        prompt = f"""Generate a {difficulty} level interview question based on:
        Job Description: {context['job_description']}
        Previous Answer: {context['previous_answer']}
        """
        
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.llama_model.device)
        outputs = self.llama_model.generate(
            inputs.input_ids,
            max_length=200,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)

    def score_answer(self, question, answer):
        inputs = self.scoring_tokenizer(
            f"{question} [SEP] {answer}",
            return_tensors="pt",
            padding=True,
            truncation=True
        )
        outputs = self.scoring_model(**inputs)
        return torch.sigmoid(outputs.logits).item() * 10
    
# from .model_loader import ModelLoader

# class QuestionGenerator:
#     def __init__(self):
#         self.loader = ModelLoader.instance()
        
#     def generate_question(self, job_desc, prev_answer, difficulty):
#         prompt = f"""Generate a {difficulty} level interview question based on:
#         - Job Description: {job_desc[:1000]}
#         - Previous Answer: {prev_answer[:500]}
        
#         Format: Start directly with the question, keep it under 25 words."""

#         inputs = self.loader.llama_tokenizer(
#             prompt,
#             return_tensors="pt",
#             max_length=1024,
#             truncation=True
#         ).to(self.loader.device)

#         outputs = self.loader.llama_model.generate(
#             inputs.input_ids,
#             max_new_tokens=100,
#             temperature=0.7,
#             top_p=0.9,
#             do_sample=True
#         )
        
#         question = self.loader.llama_tokenizer.decode(
#             outputs[0],
#             skip_special_tokens=True
#         )
#         return self._clean_question(question)

#     def _clean_question(self, text):
#         return text.split('\n')[0].replace('**', '').strip()
    
# class AnswerEvaluator:
#     def __init__(self):
#         self.loader = ModelLoader.instance()
    
#     def score_answer(self, answer, question):
#         result = self.loader.scoring_model(
#             f"{question} [SEP] {answer}",
#             truncation=True,
#             max_length=512
#         )
#         return round(result[0]['score'] * 10, 1)