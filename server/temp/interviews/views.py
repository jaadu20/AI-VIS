@api_view(['POST'])
def start_interview(request, job_id):
    # Initialize session
    session = InterviewSession.objects.create(
        candidate=request.user,
        job_id=job_id,
        status='ongoing'
    )
    
    # Generate first questions
    engine = AIVisInterviewEngine(job_id)
    questions = engine.generate_initial_questions()
    
    # Store initial questions
    for idx, question in enumerate(questions):
        InterviewQuestion.objects.create(
            session=session,
            text=question,
            question_type='basic',
            difficulty='medium',
            order=idx+1
        )
    
    return Response({
        'session_id': session.id,
        'first_question': questions[0]
    })