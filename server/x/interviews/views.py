import json
import random
import torch
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Interview, Answer
from .serializers import InterviewSerializer, AnswerSerializer

# Hugging Face libraries and login for question generation/answer analysis
from transformers import AutoTokenizer, AutoModelForCausalLM
from huggingface_hub import login

# Log in using your HF API key
login(token="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")

model_id = "meta-llama/Llama-3.1-8B"
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    device_map="auto",
    attn_implementation="eager"
)
tokenizer = AutoTokenizer.from_pretrained(model_id)

def generate_ai_question(job_description: str, previous_answer: str, question_level: str) -> str:
    """
    Use prompt engineering to generate interview questions.
    """
    prompt = (
        f"Job description: {job_description}\n"
        f"Candidate's previous answer: {previous_answer}\n"
        f"Desired question difficulty: {question_level}\n"
        "Generate a follow-up interview question for the candidate:"
    )
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(
        inputs.input_ids,
        max_new_tokens=100,
        temperature=0.7,
        top_p=0.9,
        do_sample=True
    )
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    # Extract the last line (which is assumed to be the question)
    question = generated_text.split("\n")[-1].strip()
    return question

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_question(request):
    # Expecting jobDescription, previousAnswer, and questionLevel fields.
    data = request.data
    job_description = data.get("jobDescription")
    previous_answer = data.get("previousAnswer", "")
    question_level = data.get("questionLevel", "adaptive")

    if not job_description:
        return Response({"error": "Job description is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        new_question = generate_ai_question(job_description, previous_answer, question_level)
        return Response({"question": new_question}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Failed to generate question: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_answer(request):
    """
    Expects: answer text (from manual edit or speech-to-text conversion), current question,
    interview ID, and optionally media scores from your voice and facial analysis endpoints.
    """
    data = request.data
    answer_text = data.get("answer")
    question_text = data.get("question")
    interview_id = data.get("interviewId")
    # For demonstration, these scores might be provided by the frontend after calling your self-trained models.
    voice_score = data.get("voiceScore")
    facial_score = data.get("facialScore")

    if not all([answer_text, question_text, interview_id]):
        return Response({"error": "Answer, question, and interviewId are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        interview = Interview.objects.get(id=interview_id, candidate=request.user)
    except Interview.DoesNotExist:
        return Response({"error": "Interview not found."}, status=status.HTTP_404_NOT_FOUND)

    answer_obj = Answer.objects.create(
        interview=interview,
        question=question_text,
        answer_text=answer_text,
    )

    # Use the Hugging Face model to perform answer analysis. (Replace with your own analysis logic.)
    answer_obj.content_score = random.randint(60, 100)  # Simulated score percentage.
    # Use provided voice and facial scores (or default if not provided).
    answer_obj.voice_score = voice_score if voice_score is not None else random.randint(60, 100)
    answer_obj.facial_score = facial_score if facial_score is not None else random.randint(60, 100)
    answer_obj.save()

    # Check if this is the last question (e.g., 12 questions have been answered)
    if interview.answers.count() >= 12:
        total_content = sum(a.content_score for a in interview.answers.all())
        total_voice = sum(a.voice_score for a in interview.answers.all())
        total_facial = sum(a.facial_score for a in interview.answers.all())
        interview.final_score = (total_content + total_voice + total_facial) / (3 * 12)
        interview.feedback = (
            f"Content Avg: {total_content/12:.1f}, Voice Avg: {total_voice/12:.1f}, Facial Avg: {total_facial/12:.1f}. "
            "Work on improving clarity and expression for higher scores."
        )
        interview.is_completed = True
        interview.save()

    serializer = AnswerSerializer(answer_obj)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def interview_results(request, interview_id):
    try:
        interview = Interview.objects.get(id=interview_id, candidate=request.user)
    except Interview.DoesNotExist:
        return Response({"error": "Interview not found."}, status=status.HTTP_404_NOT_FOUND)

    if not interview.is_completed:
        return Response({"error": "Interview is not complete yet."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = InterviewSerializer(interview)
    return Response(serializer.data, status=status.HTTP_200_OK)
