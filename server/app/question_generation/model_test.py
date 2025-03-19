import torch
from transformers import BitsAndBytesConfig, pipeline
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Meta-Llama-3-8B")
model = AutoModelForSeq2SeqLM.from_pretrained("meta-llama/Meta-Llama-3-8B")
input_text = "give technical question related to applied python"
input_ids = tokenizer(input_text, return_tensors="pt").input_ids
outputs = model.generate(input_ids)
print(tokenizer.decode(outputs[0]))