import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline

def generate_questions():
    # Load model with GPU acceleration
    model_name = "google/long-t5-tglobal-base"
    
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(
        model_name,
        device_map="auto",  # Automatic device placement
        torch_dtype=torch.float16  # Use FP16 for better performance
    )

    # Create pipeline without device argument
    generator = pipeline(
        "text2text-generation",
        model=model,
        tokenizer=tokenizer,
    )

    # Generate questions
    prompt = "Generate 10 basic Python programming questions for beginners:"
    
    results = generator(
        prompt,
        max_length=300,
        num_beams=3,
        num_return_sequences=1,
        temperature=0.7,
        top_p=0.90,
        do_sample=True
    )

    # Process output
    questions = results[0]['generated_text'].split('\n')
    print("Basic Python Questions:")
    for i, q in enumerate(filter(None, questions), 1):
        print(f"{i}. {q.strip()}")

if __name__ == "__main__":
    generate_questions()