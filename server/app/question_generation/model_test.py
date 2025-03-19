from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# Use the correct model identifier
tokenizer = AutoTokenizer.from_pretrained("t5-large")
model = AutoModelForSeq2SeqLM.from_pretrained("t5-large")

import torch

def generate_interview_question(job_description):
    prompt = f"Generate an easy-level interview question based on the following job description: {job_description}"
    
    # Tokenize the input text
    input_ids = tokenizer(prompt, return_tensors="pt").input_ids
    
    # Generate output
    output_ids = model.generate(input_ids, max_length=50, num_return_sequences=1)
    
    # Decode the output
    question = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    
    return question

job_desc = "Software Engineer responsible for developing web applications using Python and Django."
question = generate_interview_question(job_desc)
print("Generated Interview Question:", question)
