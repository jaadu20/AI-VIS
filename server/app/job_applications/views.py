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


class EligibilityCheckView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EligibilityCheckSerializer
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        job = serializer.validated_data['job']
        cv_file = serializer.validated_data['cv']

        try:
            # Create application
            application = Application.objects.create(
                applicant=request.user,
                job=job,
                cv=cv_file,
                status='under_review'
            )

            # Create interview immediately
            interview = Interview.objects.create(
                application=application,
                interview_id=uuid.uuid4(),
                difficulty='medium'  # Will be updated later
            )

            return Response({
                "eligible": True,
                "application_id": application.id,
                "interview_id": str(interview.interview_id)
            })

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
#--------------------------------------------------------------------------------------------------------
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


        
# class EligibilityCheckView(generics.GenericAPIView):
#     permission_classes = [IsAuthenticated]
#     serializer_class = EligibilityCheckSerializer
#     parser_classes = [MultiPartParser, FormParser]

#     def post(self, request):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
        
#         job = serializer.validated_data['job']
#         cv_file = serializer.validated_data['cv']
        
#         try:
#             # Create application
#             application = Application.objects.create(
#                 applicant=request.user,
#                 job=job,
#                 cv=cv_file
#             )
            
#             # Here you would add real eligibility check logic
#             # This is a mock implementation
#             is_eligible = True  # Replace with actual check
            
#             if is_eligible:
#                 return Response({
#                     "eligible": True,
#                     "application_id": application.id,
#                     "message": "Eligibility check passed"
#                 })
#             else:
#                 application.delete()
#                 return Response({
#                     "eligible": False,
#                     "message": "Doesn't meet requirements"
#                 }, status=400)

#         except Exception as e:
#             return Response({
#                 "error": str(e)
#             }, status=500)