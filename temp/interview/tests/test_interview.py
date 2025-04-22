from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from interview.models import Interview

class InterviewTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test', password='test')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_interview_flow(self):
        # Start interview
        response = self.client.post('/api/interview/start/', {'job_id': '123'})
        self.assertEqual(response.status_code, 201)
        
        # Generate questions
        interview_id = response.data['interview_id']
        response = self.client.post('/api/interview/generate-question/', {
            'interview_id': interview_id,
            'previous_answer': 'Test answer'
        })
        self.assertEqual(response.status_code, 200)
        
        # Submit answer
        response = self.client.post('/api/interview/submit-answer/', {
            'interview_id': interview_id,
            'question_id': 1,
            'answer': 'Test answer'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('score', response.data)