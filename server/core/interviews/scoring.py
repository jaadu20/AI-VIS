# scoring.py
from server.core.interviews.models import CandidateAnswer, InterviewSession


def calculate_final_score(session_id):
    session = InterviewSession.objects.get(id=session_id)
    answers = CandidateAnswer.objects.filter(question__session=session)
    
    weights = {
        'nlp': 0.5,
        'voice': 0.25,
        'facial': 0.25
    }
    
    total = 0
    for answer in answers:
        total += (
            (answer.nlp_score * weights['nlp']) +
            (answer.voice_score * weights['voice']) +
            (answer.facial_score * weights['facial'])
        )
    
    session.final_score = total / len(answers)
    session.save()
    
    # Generate report
    generate_score_report(session.id)
    return session.final_score

def generate_score_report(session_id):
    session = InterviewSession.objects.get(id=session_id)
    answers = CandidateAnswer.objects.filter(question__session=session)
    
    report_data = {
        'scores_over_time': [],
        'difficulty_progression': [],
        'emotion_analysis': []
    }
    
    for idx, answer in enumerate(answers):
        report_data['scores_over_time'].append({
            'question': idx+1,
            'total': answer.nlp_score * 0.5 + answer.voice_score * 0.25 + answer.facial_score * 0.25
        })
        
        report_data['difficulty_progression'].append(
            answer.question.difficulty
        )
        
        report_data['emotion_analysis'].append({
            'question': idx+1,
            'dominant_emotion': get_dominant_emotion(answer.video_path)
        })
    
    # Store report in database
    Report.objects.create(
        session=session,
        data=report_data,
        final_score=session.final_score
    )