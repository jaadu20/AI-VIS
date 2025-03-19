from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("google-t5/t5-large")
model = AutoModelForSeq2SeqLM.from_pretrained("google-t5/t5-large")

# Move model to GPU if available
device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)

# Create a more specific prompt for technical questions
input_text = "Generate a technical interview question about applied Python programming for a machine learning position: "

# Tokenize input with proper formatting
inputs = tokenizer(
    input_text,
    max_length=50,
    truncation=True,
    return_tensors="pt"
).to(device)

# Generate output with improved parameters
outputs = model.generate(
    inputs.input_ids,
    max_length=150,
    num_beams=5,
    early_stopping=True,
    num_return_sequences=3,
    temperature=0.9,
    top_k=50,
    top_p=0.95,
    do_sample=True
)

# Decode and clean up generated questions
generated_questions = [tokenizer.decode(
    output, 
    skip_special_tokens=True, 
    clean_up_tokenization_spaces=True
) for output in outputs]

print("Generated Technical Questions:")
for i, question in enumerate(generated_questions, 1):
    print(f"{i}. {question}")