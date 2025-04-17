from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

tokenizer = AutoTokenizer.from_pretrained("google-t5/t5-small")
model = AutoModelForSeq2SeqLM.from_pretrained("google-t5/t5-small")

def generate_question(job_description: str, difficulty: str = "medium") -> str:
    # Clean and structure the prompt with clear instructions
    prompt = f"""Generate a {difficulty}-level technical interview question for a Python developer role. 
    Job requirements: {job_description.strip()}."""
    
    inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
    
    outputs = model.generate(
        inputs.input_ids,
        max_length=80,
        num_beams=4,
        early_stopping=True,
        no_repeat_ngram_size=2,
        temperature=0.7  # Add some creativity
    )
    
    question = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Post-process to ensure question format
    if not question.endswith("?"):
        question += "?"
    return question.capitalize()

job_desc = "Python developer with strong knowledge of Python core concepts and web frameworks"
question = generate_question(job_desc, difficulty="medium")
print(f"Generated Question: {question}")