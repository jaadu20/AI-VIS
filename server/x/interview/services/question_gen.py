# interview/services/question_gen.py
import os
import groq

class QuestionGenerator:
    @staticmethod
    def generate(job_desc, previous_answer):
        groq_api_key = os.getenv("GROQ_API_KEY")
        client = groq.Groq(api_key=groq_api_key)

        prompt = f"Generate an interview question for a {job_desc} candidate, based on their previous answer: {previous_answer}.  Make the question concise and relevant."

        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model="mixtral-8x7b-32768",
                temperature=0.7,
                max_tokens=150,
            )
            return chat_completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error generating question: {e}")
            return "Could you please elaborate further?"
