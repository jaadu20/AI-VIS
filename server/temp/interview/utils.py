# interview/utils.py
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from huggingface_hub import login
import os

# Login to Hugging Face using your token (ideally set this as an env variable)
HUGGINGFACE_TOKEN = os.environ.get("HUGGINGFACE_TOKEN", "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")
login(token=HUGGINGFACE_TOKEN)

MODEL_ID = "meta-llama/Llama-3.1-8B"

# Load model and tokenizer only once at import time:
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float16,
    device_map="auto",
    attn_implementation="eager"
)
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)

def generate_question(job_description: str, previous_answer: str, question_level: str) -> str:
    """
    Generate a follow-up question based on the job description, previous answer,
    and required difficulty level.
    """
    # Adjust your prompt engineering as needed:
    prompt = (
        f"Given the job description: {job_description}\n"
        f"and the candidate's previous answer: {previous_answer}\n"
        f"Generate a follow-up interview question of {question_level} difficulty:\n"
    )
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(
        inputs.input_ids,
        max_new_tokens=100,  # adjust tokens as required
        temperature=0.7,
        top_p=0.9,
        do_sample=True
    )
    question = tokenizer.decode(outputs[0], skip_special_tokens=True)
    # Basic post-processing: return first line or trim extra content if needed.
    question = question.strip().split("\n")[0]
    return question

def analyze_answer(answer: str, question: str) -> float:
    """
    Analyze the candidate's answer using the language model to generate a content score.
    Here you can call the language model to rate the answer.
    For simplicity, we assume the score is computed as a dummy percentage.
    """
    # You could develop a prompt that asks the model to score the answer.
    # In this dummy implementation, let’s assume a static score.
    # Replace this with real analysis.
    return 75.0
