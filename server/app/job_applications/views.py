# job application view.py

import logging
from django.shortcuts import render
from fastapi import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from jobs.models import Job
from jobs.serializers import JobSerializer
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Application
from .serializers import ApplicationSerializer, EligibilityCheckSerializer
from interview.models import Interview
from rest_framework import status
from rest_framework.response import Response 
import uuid  
from .cv_analyzer import CVAnalyzer
from rest_framework.response import Response
from rest_framework import status

# Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.ERROR)

class EligibilityCheckView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EligibilityCheckSerializer
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = Job.objects.get(id=request.data.get('job'))
            cv_file = request.FILES['cv']
            
            # Analyze CV
            analyzer = CVAnalyzer()
            cv_text = analyzer.extract_text_from_pdf(cv_file)
            entities = analyzer.extract_entities(cv_text)
            match_score = analyzer.calculate_match_score(cv_text, job.description)
            
            # Check eligibility (example threshold - adjust as needed)
            is_eligible = match_score >= 0.4
            
            # Create application
            application = Application.objects.create(
                applicant=request.user,
                job=job,
                cv=cv_file,
                status='eligible' if is_eligible else 'not_eligible',
                match_score=match_score,
                skills_matched=list(entities.get('SKILLS', [])),
                requirements_matched=job.requirements.split('\n')
            )

            if not is_eligible:
                return Response({
                    "eligible": False,
                    "message": "CV does not match job requirements",
                    "match_score": match_score,
                    "missing_skills": list(set(job.requirements) - entities.get('SKILLS', []))
                }, status=status.HTTP_200_OK)

            # Create interview
            difficulty_map = {
                'entry': 'easy',
                'mid': 'medium',
                'senior': 'hard',
                'lead': 'hard'
            }
            
            interview = Interview.objects.create(
                application=application,
                interview_id=uuid.uuid4(),
                difficulty=difficulty_map.get(
                    job.experience_level.lower(),
                    'medium'
                )
            )

            return Response({
                "eligible": True,
                "application_id": application.id,
                "interview_id": str(interview.interview_id),
                "match_score": match_score
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Eligibility check error: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class JobDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Job.objects.all().select_related('company__company_profile')
    serializer_class = JobSerializer

class ApplicationCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)
