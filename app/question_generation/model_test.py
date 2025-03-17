# from transformers import T5ForConditionalGeneration, T5Tokenizer

# model_name = "ramsrigouthamg/t5_squad_v1"
# model = T5ForConditionalGeneration.from_pretrained(model_name)
# tokenizer = T5Tokenizer.from_pretrained(model_name)

# context = "Looking for a Python developer with Django experience."
# input_text = f"generate question: {context}"

# inputs = tokenizer.encode(input_text, return_tensors="pt")
# outputs = model.generate(inputs)

# print(tokenizer.decode(outputs[0], skip_special_tokens=True))












# from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# tokenizer = AutoTokenizer.from_pretrained("google-t5/t5-large")
# model = AutoModelForSeq2SeqLM.from_pretrained("google-t5/t5-large")

# context = "Looking for a Python developer with Django experience."
# answer = "Django framework"

# input_text = f"<answer> {answer} <context> {context}"
# inputs = tokenizer.encode(input_text, return_tensors="pt")

# outputs = model.generate(inputs, max_length=128, num_return_sequences=3, num_beams=5)

# questions = [tokenizer.decode(output, skip_special_tokens=True) for output in outputs]

# print(questions)


from transformers import T5ForConditionalGeneration, T5Tokenizer

# Load model and tokenizer
model_name = "t5-large"
tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name)

# Input: Job Description (Example)
job_description = "Data Scientist with experience in Python, Machine Learning, and NLP."

# Format input as a task for T5
input_text = f"generate interview questions: {job_description}"
input_ids = tokenizer.encode(input_text, return_tensors="pt")

# Generate questions
output_ids = model.generate(input_ids, max_length=100, num_return_sequences=3)

# Decode and print questions
questions = [tokenizer.decode(q, skip_special_tokens=True) for q in output_ids]
for i, q in enumerate(questions, 1):
    print(f"Q{i}: {q}")
