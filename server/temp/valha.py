from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

# Load the QG model
tokenizer = AutoTokenizer.from_pretrained("valhalla/t5-small-qa-qg-hl")
model = AutoModelForSeq2SeqLM.from_pretrained("valhalla/t5-small-qa-qg-hl")

def generate_technical_questions(job_description: str, num_questions: int = 5) -> list:
    """
    Generate technical interview questions using QA-focused T5 model
    Args:
        job_description: Job requirements (e.g., "Python, Django, AWS")
        num_questions: Number of questions to generate (1-5)
    Returns:
        List of formatted technical questions
    """
    # Structure input for QA generation
    input_text = f"generate questions: {job_description} ||| technical interview"
    
    inputs = tokenizer(
        input_text,
        max_length=512,
        truncation=True,
        padding="max_length",
        return_tensors="pt"
    )
    
    # Generation parameters optimized for technical questions
    outputs = model.generate(
        input_ids=inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        max_length=100,
        num_beams=5,
        num_return_sequences=num_questions,
        early_stopping=True,
        no_repeat_ngram_size=3,
        temperature=0.85,
        top_k=40
    )
    
    # Process and filter outputs
    questions = []
    technical_keywords = ["how", "what", "explain", "implement", "compare", "design"]
    
    for output in outputs:
        question = tokenizer.decode(output, skip_special_tokens=True)
        
        # Ensure proper question format
        question = question.split("?")[0] + "?" if "?" in question else question + "?"
        question = question.strip().capitalize()
        
        # Filter for technical questions
        if any(keyword in question.lower() for keyword in technical_keywords):
            questions.append(question)
    
    # Remove duplicates while preserving order
    seen = set()
    return [q for q in questions if not (q in seen or seen.add(q))][:num_questions]

# Example usage
if __name__ == "__main__":
    job_desc = "Python developer with Django, AWS, and database experience"
    questions = generate_technical_questions(job_desc)
    
    print(f"Technical Interview Questions for {job_desc}:")
    for i, q in enumerate(questions, 1):
        print(f"{i}. {q}")