# job application view.py

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
            cv_file = serializer.validated_data['cv']
            
            # Validate CV file
            if cv_file.content_type != 'application/pdf':
                return Response(
                    {"error": "Only PDF files are allowed"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create application
            application = Application.objects.create(
                applicant=request.user,
                job=job,
                cv=cv_file,
                status='under_review'
            )

            # Create interview with proper difficulty mapping
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
                    job.experience_level.lower(),  # Ensure case-insensitive
                    'medium'  # Default value
                )
            )

            return Response({
                "eligible": True,
                "application_id": application.id,
                "interview_id": str(interview.interview_id)
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Add proper error logging
            print(f"Error in eligibility check: {str(e)}")
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
