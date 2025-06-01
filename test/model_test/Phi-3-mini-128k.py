# Load model directly
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Initialize tokenizer and model
# Phi-3 models are designed for production environments and are open-source under the MIT License.[1, 2]
# They are known for blazing fast inference, making them suitable for low-latency applications.[1, 2]
tokenizer = AutoTokenizer.from_pretrained("microsoft/Phi-3-mini-128k-instruct", trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained("microsoft/Phi-3-mini-128k-instruct", trust_remote_code=True)

# Move model to GPU if available for faster inference
if torch.cuda.is_available():
    model.to("cuda")
    print("Model moved to GPU for faster inference.")
else:
    print("CUDA not available. Running model on CPU, which may be slower.")

# Define the prompt for generating a Python interview question
# Phi-3 models are best suited for prompts using the chat format.[2]
messages = [
    {"role": "system", "content": "You are an expert Python interviewer. Generate a challenging Python interview question."},
    {"role": "user", "content": "Generate a Python interview question about data structures, specifically focusing on linked lists, and include a small code example for context."},
]

# Apply the chat template and tokenize the input
input_ids = tokenizer.apply_chat_template(messages, add_generation_prompt=True, return_tensors="pt")

# Move input_ids to GPU if model is on GPU
if torch.cuda.is_available():
    input_ids = input_ids.to("cuda")

# Generate the response
# max_new_tokens controls the length of the generated answer.
# do_sample=True enables sampling, temperature controls randomness (lower = less random).
# pad_token_id and eos_token_id are important for correct generation and stopping.
print("Generating Python interview question...")
output_ids = model.generate(
    input_ids,
    max_new_tokens=200,
    do_sample=True,
    temperature=0.7,
    pad_token_id=tokenizer.pad_token_id,
    eos_token_id=tokenizer.eos_token_id
)

# Decode the generated tokens to text
# Skip the input tokens to get only the generated response.
generated_text = tokenizer.decode(output_ids[input_ids.shape[-1]:], skip_special_tokens=True)

print("\nGenerated Python Interview Question:")
print(generated_text)

# Example of how to generate another question with a different focus
messages_advanced = [
    {"role": "system", "content": "You are an expert Python interviewer. Generate a challenging Python interview question."},
    {"role": "user", "content": "Generate a Python interview question about decorators and their common use cases, with a brief explanation of what you expect in the answer."},
]

input_ids_advanced = tokenizer.apply_chat_template(messages_advanced, add_generation_prompt=True, return_tensors="pt")
if torch.cuda.is_available():
    input_ids_advanced = input_ids_advanced.to("cuda")

print("\nGenerating another Python interview question (about decorators)...")
output_ids_advanced = model.generate(
    input_ids_advanced,
    max_new_tokens=200,
    do_sample=True,
    temperature=0.7,
    pad_token_id=tokenizer.pad_token_id,
    eos_token_id=tokenizer.eos_token_id
)

generated_text_advanced = tokenizer.decode(output_ids_advanced[input_ids_advanced.shape[-1]:], skip_special_tokens=True)

print("\nGenerated Python Interview Question (Decorators):")
print(generated_text_advanced)