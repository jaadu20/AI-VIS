# job_applications/views.py

import logging
from django.shortcuts import render
from fastapi import Response
from rest_framework.permissions import IsAuthenticated
from jobs.models import Job
from jobs.serializers import JobSerializer
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Application
from .serializers import ApplicationSerializer, EligibilityCheckSerializer
from interview.models import Interview
from rest_framework import status,generics
from rest_framework.response import Response 
import uuid  
from .cv_analyzer import CVAnalyzer
from .services import extract_text_from_file, extract_skills, calculate_match_score


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
            job = serializer.validated_data['job']
            cv_file = request.FILES['cv']
            
            cv_text = extract_text_from_file(cv_file)
            candidate_skills = extract_skills(cv_text)
            
            job_text = f"{job.title}\n{job.description}\n{job.requirements}"
            is_eligible, match_score = calculate_match_score(
                job_text,
                candidate_skills
            )
            
            application = Application.objects.create(
                applicant=request.user,
                job=job,
                cv=cv_file,
                status='eligible' if is_eligible else 'not_eligible',
                match_score=match_score,
                skills_matched=candidate_skills,
                requirements_matched=job.requirements.split('\n') if job.requirements else []
            )

            if not is_eligible:
                return Response({
                    "eligible": False,
                    "message": "CV does not meet requirements",
                    "match_score": match_score,
                    "missing_skills": list(set(extract_skills(job_text)) - set(candidate_skills))
                }, status=status.HTTP_200_OK)

            interview = Interview.objects.create(
                application=application,
                interview_id=uuid.uuid4(),
                difficulty=self.get_difficulty_level(job.experience_level)
            )

            return Response({
                "eligible": True,
                "application_id": application.id,
                "interview_id": str(interview.interview_id),
                "match_score": match_score
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Eligibility check error: {str(e)}", exc_info=True)
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_difficulty_level(self, experience_level):
        difficulty_map = {
            'entry': 'easy',
            'mid': 'medium',
            'senior': 'hard',
            'lead': 'hard'
        }
        return difficulty_map.get(experience_level.lower(), 'medium')
    
class JobDetailView(generics.RetrieveAPIView):
    # authentication_classes = [] 
    permission_classes = [AllowAny] 
    queryset = Job.objects.all().select_related('company__company_profile')
    serializer_class = JobSerializer

class ApplicationCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)
