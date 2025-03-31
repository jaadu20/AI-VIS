from transformers import AutoTokenizer, AutoModelForCausalLM
from huggingface_hub import login
import torch


login(token="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")

model_id = "meta-llama/Llama-3.1-8B"

# Load model with updated configuration handling
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    device_map="auto",
    attn_implementation="eager"
)

tokenizer = AutoTokenizer.from_pretrained(model_id)

prompt = "Generate 5 technical interview questions for a Python developer role:\n1."
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

outputs = model.generate(
    inputs.input_ids,
    max_new_tokens=200,
    temperature=0.7,
    top_p=0.9,
    do_sample=True
)

print(tokenizer.decode(outputs[0], skip_special_tokens=True))