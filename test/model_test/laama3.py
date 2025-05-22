from transformers import AutoTokenizer, AutoModelForCausalLM
from huggingface_hub import login
import torch

login(token="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") 

model_id = "meta-llama/Llama-3.1-8B"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16, 
    device_map="auto",          
    attn_implementation="sdpa" 
)

def generate_questions(job_role: str, num_questions: int = 5) -> list:
    """
    Generate technical interview questions using Llama-3.1-8B
    Args:
        job_role: Target job role (e.g., "Python developer")
        num_questions: Number of questions to generate
    Returns:
        List of generated questions
    """
    prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
    You are a technical interviewer. Generate {num_questions} specific interview questions for a {job_role}.
    Return ONLY the numbered questions with no additional commentary.<|eot_id|>
    <|start_header_id|>assistant<|end_header_id|>
    1. """
    
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    outputs = model.generate(
        **inputs,
        max_new_tokens=300,
        temperature=0.7,
        top_p=0.9,
        do_sample=True,
        num_return_sequences=1,
        pad_token_id=tokenizer.eos_token_id,
        eos_token_id=tokenizer.eos_token_id
    )
    
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    questions = [
        q.strip() for q in generated_text.split("\n") 
        if q.strip() and (q.strip().startswith(tuple(str(i) for i in range(1, num_questions+1))))
    ]
    
    return questions[:num_questions]

if __name__ == "__main__":
    questions = generate_questions("Python developer with Django experience")
    for i, question in enumerate(questions, 1):
        print(f"{i}. {question}")




# from transformers import AutoTokenizer, AutoModelForCausalLM
# from huggingface_hub import login
# import torch


# login(token="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")

# model_id = "meta-llama/Llama-3.1-8B"

# # Load model with updated configuration handling
# model = AutoModelForCausalLM.from_pretrained(
#     model_id,
#     torch_dtype=torch.float16,
#     device_map="auto",
#     attn_implementation="eager"
# )

# tokenizer = AutoTokenizer.from_pretrained(model_id)

# prompt = "Generate 5 technical interview questions for a Python developer role:\n1."
# inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

# outputs = model.generate(
#     inputs.input_ids,
#     max_new_tokens=200,
#     temperature=0.7,
#     top_p=0.9,
#     do_sample=True
# )

# print(tokenizer.decode(outputs[0], skip_special_tokens=True))

# # from transformers import AutoTokenizer, AutoModelForCausalLM
# # from huggingface_hub import login
# # import torch

# # # 1. Hugging Face Login (replace with your token)
# # HF_TOKEN = "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"  # Get this from https://huggingface.co/settings/tokens
# # login(token=HF_TOKEN)

# # # 2. Load Model with Optimizations
# # model_name = "meta-llama/Llama-3.1-8B"
# # tokenizer = AutoTokenizer.from_pretrained(model_name)
# # model = AutoModelForCausalLM.from_pretrained(
# #     model_name,
# #     torch_dtype=torch.float16,  # FP16 for faster inference
# #     device_map="auto",          # Auto-select GPU/CPU
# #     load_in_4bit=True,          # 4-bit quantization
# #     token=HF_TOKEN              # Pass token here as well
# # )

# # # 3. Question Generation Function
# # def generate_question(job_description: str, difficulty: str = "medium") -> str:
# #     """
# #     Generates interview questions with Llama-3.1-8B
# #     Args:
# #         job_description: Job requirements text
# #         difficulty: 'easy', 'medium', or 'hard'
# #     Returns:
# #         Generated question string
# #     """
# #     prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
# #     You are a technical interviewer. Generate one {difficulty}-level question about:
# #     {job_description.strip()}
# #     Return ONLY the question with no additional commentary.<|eot_id|>
# #     <|start_header_id|>assistant<|end_header_id|>"""
    
# #     inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
# #     outputs = model.generate(
# #         **inputs,
# #         max_new_tokens=80,
# #         temperature=0.7,
# #         top_p=0.9,
# #         do_sample=True,
# #         num_return_sequences=1,
# #         pad_token_id=tokenizer.eos_token_id
# #     )
    
# #     # Clean output
# #     question = tokenizer.decode(outputs[0], skip_special_tokens=True)
# #     question = question.split("<|eot_id|>")[-1].strip()
    
# #     # Ensure proper formatting
# #     if not question.endswith("?"):
# #         question = question.split("?")[0] + "?" if "?" in question else question + "?"
    
# #     return question

# # # 4. Example Usage
# # if __name__ == "__main__":
# #     job_desc = "Python backend developer with FastAPI and AWS experience"
# #     print(generate_question(job_desc, "hard"))
# #     # Example output: "How would you implement autoscaling for a FastAPI 
# #     #                  application deployed on AWS ECS?"