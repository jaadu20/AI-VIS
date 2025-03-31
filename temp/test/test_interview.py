# tests/test_interview.py
class InterviewTestCase(TestCase):
    def test_question_generation(self):
        job = Job.objects.create(title="Software Engineer")
        session = InterviewSession(job.id)
        questions = session.generate_questions()
        self.assertTrue(len(questions) >= 3)