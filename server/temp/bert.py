from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from huggingface_hub import login
import torch

# Login to Hugging Face (if needed)
login(token="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")  # Replace with your token

# Load the correct model type
model_id = "facebook/bart-large-cnn"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSeq2SeqLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    device_map="auto"
)

def generate_interview_questions(job_description: str, num_questions: int = 5) -> list:
    """
    Generate technical interview questions using BART-large-CNN
    Args:
        job_description: Job role/requirements
        num_questions: Number of questions to generate
    Returns:
        List of generated questions
    """
    # Create a structured prompt
    prompt = f"Generate {num_questions} technical interview questions for: {job_description}\nQuestions:"
    
    # Tokenize and generate
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(
        inputs.input_ids,
        max_new_tokens=200,
        num_beams=4,
        early_stopping=True,
        no_repeat_ngram_size=2
    )
    
    # Decode and format output
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract questions from the generated text
    questions = [q.strip() for q in generated_text.split("\n") if q.strip().endswith("?")]
    
    # Ensure we have the requested number of questions
    if len(questions) < num_questions:
        questions += [f"Explain your experience with {job_description.split()[0]}?"] * (num_questions - len(questions))
    
    return questions[:num_questions]

# Example usage
job_desc = "Python developer with Django and database experience"
questions = generate_interview_questions(job_desc)
for i, question in enumerate(questions, 1):
    print(f"{i}. {question}")