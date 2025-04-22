from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

# Load model
model_name = "mrm8488/t5-base-finetuned-question-generation-ap"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

def generate_technical_questions(job_description: str, num_questions: int = 5) -> list:
    """
    Generate proper technical interview questions
    Args:
        job_description: Job requirements (e.g., "Python with Django and AWS")
        num_questions: Number of questions to generate (1-5)
    Returns:
        List of technical questions
    """
    # Improved prompt with clear instructions
    input_text = f"""Generate {num_questions} specific technical interview questions for a {job_description} role.
    Focus on practical skills and problem-solving. Questions should be technical and challenging.
    Examples:
    - How would you implement [specific technology] to solve [specific problem]?
    - Explain your approach to [technical challenge]
    - Compare [technology A] and [technology B] for [use case]
    Questions:"""
    
    # Tokenize with better truncation
    inputs = tokenizer(
        input_text,
        max_length=512,
        truncation=True,
        padding="max_length",
        return_tensors="pt"
    )
    
    # Adjusted generation parameters
    outputs = model.generate(
        input_ids=inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        max_length=100,
        num_beams=5,
        num_return_sequences=num_questions,
        early_stopping=True,
        no_repeat_ngram_size=3,  # Reduced repetition
        temperature=0.9,         # More creative
        top_k=50                # Wider vocabulary sampling
    )
    
    # Process and filter outputs
    questions = []
    for output in outputs:
        question = tokenizer.decode(output, skip_special_tokens=True)
        
        # Filter and reformat questions
        if "?" in question:
            question = question.split("?")[0] + "?"
        else:
            continue
            
        # Ensure technical nature
        if any(word.lower() in question.lower() for word in ["how", "what", "explain", "compare"]):
            questions.append(question.strip().capitalize())
    
    # Deduplicate and return
    return list(dict.fromkeys(questions))[:num_questions]  # Preserves order

# Example usage
job_desc = "Python developer with Django and AWS experience"
questions = generate_technical_questions(job_desc)

print("Technical Interview Questions:")
for i, q in enumerate(questions, 1):
    print(f"{i}. {q}")