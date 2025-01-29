import requests

API_KEY = "AIzaSyCr2Lrt0l4-Ba4D4jLLuvSKtgdHZ84q6CU"  # Replace with your actual API key
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"

headers = {
    "Content-Type": "application/json"
}

# Initial difficulty level
difficulty_levels = ["easy", "medium", "hard"]
current_difficulty = 0  # Start with "easy"

# Function to get questions from Gemini API
def get_questions(difficulty, num_questions=1):
    prompt = (
        f"Generate {num_questions} Python programming question(s) for a {difficulty} difficulty level and short length. "
        "Ensure the question is conceptual, relevant, engaging, and progressively challenging. "
        "Format the response as a numbered list."
    )

    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    response = requests.post(URL, headers=headers, json=data)

    if response.status_code == 200:
        result = response.json()
        response_text = result["candidates"][0]["content"]["parts"][0]["text"]
        questions = response_text.split("\n")
        questions = [q.strip() for q in questions if q.strip()]
        return questions
    else:
        print(f"Error: {response.status_code}, {response.text}")
        return []

# Start interview with basic questions
questions = get_questions(difficulty_levels[current_difficulty], num_questions=3)

print("\nWelcome to the Python Interview!\n")

for question in questions:
    print(question)
    user_response = input("\nYour answer: ")

    # Determine next difficulty level based on response
    if len(user_response) > 20:  # If answer is detailed, increase difficulty
        current_difficulty = min(current_difficulty + 1, len(difficulty_levels) - 1)
    elif len(user_response) < 5:  # If answer is too short, decrease difficulty
        current_difficulty = max(current_difficulty - 1, 0)

    # Generate follow-up question based on response
    follow_up_questions = get_questions(difficulty_levels[current_difficulty], num_questions=1)
    
    if follow_up_questions:
        print("\nFollow-up Question:")
        print(follow_up_questions[0])
        input("\nYour answer: ")  # Capture response for future expansion

print("\nInterview Completed. Thank you!")