from transformers import AutoTokenizer, AutoModelForCausalLM

# Load the tokenizer and model with remote code trust enabled
tokenizer = AutoTokenizer.from_pretrained("Qwen/QwQ-32B", trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained("Qwen/QwQ-32B", trust_remote_code=True)

# Define your prompt
prompt = "Generate 10 interview questions related to Python."

# If using chat-based prompt formatting (optional)
messages = [{"role": "user", "content": prompt}]
# The apply_chat_template function may add necessary formatting for chat models.
formatted_prompt = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True
)

# Tokenize the prompt
inputs = tokenizer([formatted_prompt], return_tensors="pt").to(model.device)

# Generate the output
generated_ids = model.generate(
    **inputs,
    max_new_tokens=256,   # Adjust the max_new_tokens as needed
    temperature=0.6,      # Recommended sampling parameter
    top_p=0.95            # Recommended sampling parameter
)

# Decode and print the generated text
generated_text = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
print(generated_text)
