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

class EligibilityCheckView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EligibilityCheckSerializer
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = serializer.validated_data['job']
        applicant = request.user
        # Check if the applicant is eligible for the job
        if not job.is_eligible(applicant):
            return Response({
                "eligible": False,
                "message": "You are not eligible for this job"
            }, status=400)
        # If eligible, proceed with the application
        application = Application.objects.create(job=job, applicant=applicant)
        application.save()
        # Return a success response
        return Response({
            "eligible": True,
            "message": "Eligibility check passed"
        })