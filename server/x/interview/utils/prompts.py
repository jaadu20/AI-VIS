DIFFICULTY_PROMPTS = {
    "easy": """
    Generate a basic understanding question about {job_desc}.
    The question should:
    - Test fundamental concepts
    - Require short answers (1-2 sentences)
    - Be straightforward
    """,
    
    "medium": """
    Create an intermediate-level question about {job_desc}.
    The question should:
    - Require practical examples
    - Test problem-solving skills
    - Need paragraph-length answers
    """,
    
    "hard": """
    Formulate an advanced scenario-based question for {job_desc}.
    The question should:
    - Present a complex problem
    - Require critical thinking
    - Expect detailed technical explanations
    """
}

def get_difficulty_prompt(level: str, job_desc: str) -> str:
    return DIFFICULTY_PROMPTS[level].format(job_desc=job_desc)