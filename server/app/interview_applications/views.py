# applications/views.py
from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Application, Interview, InterviewQuestion, InterviewAnswer
from jobs.models import Job
from .serializers import (
    ApplicationSerializer,
    InterviewSerializer,
    InterviewQuestionSerializer,
    InterviewAnswerSerializer
)
from .permissions import IsCandidateUser, IsCompanyOrCandidateOwner
from .cv_analyzer import CVAnalyzer
import random

class ApplicationCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated, IsCandidateUser]
    
    def post(self, request):
        # Extract data from request
        job_id = request.data.get('job')
        cv_file = request.FILES.get('cv')
        
        # Validate input data
        if not job_id:
            return Response({'error': 'Job ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not cv_file:
            return Response({'error': 'CV file is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get job details
            job = Job.objects.get(id=job_id)
            
            # Create application instance
            application = Application(
                candidate=request.user,
                job=job,
                cv=cv_file,
                status='pending'
            )
            
            # Process CV and calculate match score
            cv_analyzer = CVAnalyzer()
            job_requirements = job.requirements.split('\n') if isinstance(job.requirements, str) else job.requirements
            analysis_result = cv_analyzer.analyze_cv(cv_file, job.description, job_requirements)
            
            # Update application with analysis results
            application.match_score = analysis_result['match_score']
            application.extracted_skills = analysis_result['extracted_skills']
            application.missing_skills = ", ".join(analysis_result['missing_skills'])
            application.eligible = analysis_result['eligible']
            
            # Save application
            application.save()
            
            # Create interview if eligible
            if application.eligible:
                application.status = 'interview'
                application.save()
                
                # Create interview
                interview = Interview.objects.create(application=application)
                
                # Generate questions based on job requirements
                self.generate_interview_questions(interview, job)
                
                # Return successful response with application details
                serializer = ApplicationSerializer(application)
                return Response({
                    'id': application.id,
                    'eligible': True,
                    'match_score': application.match_score,
                    'extracted_skills': application.extracted_skills,
                    'missing_skills': application.missing_skills,
                    'details': serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                # Return ineligible response
                return Response({
                    'eligible': False,
                    'match_score': application.match_score,
                    'missing_skills': application.missing_skills
                }, status=status.HTTP_200_OK)
                
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def generate_interview_questions(self, interview, job):
        """Generate interview questions based on job requirements"""
        # Basic questions that apply to any job
        general_questions = [
            "Tell me about yourself and your background.",
            "Why are you interested in this position?",
            "What are your strengths and weaknesses?",
            "Describe a challenging situation you faced at work and how you handled it.",
            "Where do you see yourself in five years?",
            "Why should we hire you for this position?",
            "How do you handle stress and pressure?",
            "Describe your ideal work environment.",
            "What motivates you professionally?",
            "Do you have any questions for us about the role or company?"
        ]
        
        # Technical/role-specific questions based on job requirements
        technical_questions = []
        
        # Extract key skills from job requirements
        job_requirements = job.requirements.split('\n') if isinstance(job.requirements, str) else job.requirements
        job_description = job.description
        
        cv_analyzer = CVAnalyzer()
        job_skills = cv_analyzer.extract_skills(job_description + " " + " ".join(job_requirements))
        
        # Generate questions based on key skills
        for skill in job_skills[:5]:  # Limit to top 5 skills
            technical_questions.append(f"Describe your experience with {skill}.")
            technical_questions.append(f"What projects have you worked on that utilized {skill}?")
        
        # Add role-specific questions based on job title
        job_title_lower = job.title.lower()
        
        if "developer" in job_title_lower or "engineer" in job_title_lower:
            technical_questions.extend([
                "Explain your approach to debugging a complex technical issue.",
                "How do you keep up with the latest developments in technology?",
                "Describe your experience with version control systems.",
                "How do you ensure your code is maintainable and scalable?"
            ])
        elif "manager" in job_title_lower or "lead" in job_title_lower:
            technical_questions.extend([
                "Describe your management style.",
                "How do you handle conflicts within your team?",
                "How do you prioritize tasks when managing multiple projects?",
                "How do you measure the success of your team?"
            ])
        elif "designer" in job_title_lower:
            technical_questions.extend([
                "Walk us through your design process.",
                "How do you incorporate user feedback into your designs?",
                "How do you balance aesthetics with functionality?",
                "Describe a project where you had to make design compromises."
            ])
        
        # Select questions for the interview
        selected_questions = random.sample(general_questions, min(5, len(general_questions)))
        if technical_questions:
            selected_questions.extend(random.sample(technical_questions, min(5, len(technical_questions))))
        
        # Create interview questions
        for i, question_text in enumerate(selected_questions):
            InterviewQuestion.objects.create(
                interview=interview,
                question_text=question_text,
                order=i+1
            )

class ApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'candidate':
            return Application.objects.filter(candidate=user).order_by('-created_at')
        elif user.role == 'company':
            return Application.objects.filter(job__company=user).order_by('-created_at')
        return Application.objects.none()

class ApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsCompanyOrCandidateOwner]
    queryset = Application.objects.all()
    lookup_field = 'id'

class JobApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        user = self.request.user
        
        if user.role == 'company':
            return Application.objects.filter(job__id=job_id, job__company=user)
        return Application.objects.none()

class CandidateApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsCandidateUser]
    
    def get_queryset(self):
        return Application.objects.filter(candidate=self.request.user)

class InterviewDetailView(generics.RetrieveAPIView):
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated, IsCompanyOrCandidateOwner]
    
    def get_object(self):
        application_id = self.kwargs.get('application_id')
        application = get_object_or_404(Application, id=application_id)
        
        # Check permissions
        self.check_object_permissions(self.request, application)
        
        # Get or create interview
        interview, created = Interview.objects.get_or_create(application=application)
        
        return interview

class SubmitInterviewAnswerView(APIView):
    permission_classes = [IsAuthenticated, IsCandidateUser]
    
    def post(self, request, question_id):
        question = get_object_or_404(InterviewQuestion, id=question_id)
        application = question.interview.application
        
        # Check if user is the candidate who applied
        if request.user.id != application.candidate.id:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get answer text from request
        answer_text = request.data.get('answer_text')
        if not answer_text:
            return Response({'error': 'Answer text is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or update answer
        answer, created = InterviewAnswer.objects.update_or_create(
            question=question,
            defaults={'answer_text': answer_text}
        )
        
        # Update interview status if this is the first answer
        interview = question.interview
        if interview.status == 'scheduled':
            interview.status = 'in_progress'
            interview.save()
        
        # Check if all questions have been answered
        total_questions = InterviewQuestion.objects.filter(interview=interview).count()
        answered_questions = InterviewAnswer.objects.filter(question__interview=interview).count()
        
        if total_questions == answered_questions:
            # All questions answered, mark interview as completed
            interview.status = 'completed'
            interview.save()
            
            # Update application status
            application.status = 'reviewing'
            application.save()
        
        return Response({'message': 'Answer submitted successfully'}, status=status.HTTP_200_OK)

class CompleteInterviewView(APIView):
    permission_classes = [IsAuthenticated, IsCandidateUser]
    
    def post(self, request, interview_id):
        interview = get_object_or_404(Interview, id=interview_id)
        application = interview.application
        
        # Check if user is the candidate who applied
        if request.user.id != application.candidate.id:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Update interview status
        interview.status = 'completed'
        interview.save()
        
        # Update application status
        application.status = 'reviewing'
        application.save()
        
        return Response({'message': 'Interview completed successfully'}, status=status.HTTP_200_OK)
