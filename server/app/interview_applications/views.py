# applications/views.py
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Application
from .serializers import (
    ApplicationSerializer, 
    ApplicationCreateSerializer,
    EligibilityCheckSerializer,
    ScheduleInterviewSerializer
)
from jobs.models import Job
from .cv_analyzer import CVAnalyzer  
from .matching import SkillMatcher  
import logging
from celery import shared_task

@shared_task
def async_process_application(application_id):
    try:
        application = Application.objects.get(id=application_id)
        # Perform heavy processing here
        application.status = 'processed'
        application.save()
    except Exception as e:
        logger.error(f"Error processing application {application_id}: {str(e)}")

logger = logging.getLogger(__name__)

class ApplicationCreateView(generics.CreateAPIView):
    serializer_class = ApplicationCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """Create a new application"""
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        cv_file = serializer.validated_data['cv']
        job_id = serializer.validated_data['job']
        
        try:
            job = Job.objects   .get(id=job_id)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Analyze CV and calculate match score
        cv_analyzer = CVAnalyzer()
        skill_matcher = SkillMatcher()
        
        try:
            cv_analysis = cv_analyzer.analyze_cv(cv_file)
            if "error" in cv_analysis:
                return Response(cv_analysis, status=status.HTTP_400_BAD_REQUEST)
            
            match_result = skill_matcher.calculate_match_score(cv_analysis, job)
            match_score = match_result['match_score']
            missing_skills = match_result['missing_skills']
            
            # Check if the match score meets the threshold
            if match_score < 70:
                return Response({
                    "error": "Your profile doesn't match the job requirements",
                    "match_score": round(match_score, 2),
                    "missing_skills": ", ".join(missing_skills) if missing_skills else None
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create application
            application = Application(
                user=request.user,
                job=job,
                cv=cv_file,
                match_score=match_score,
                missing_skills=", ".join(missing_skills) if missing_skills else None,
                status='pending'
            )
            application.save()
            async_process_application.delay(application.id)
            return Response({"status": "processing"}, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            logger.error(f"Error creating application: {str(e)}")
            return Response(
                {"error": "Failed to process application. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter applications for the current user"""
        return Application.objects.filter(user=self.request.user)

class ApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'
    
    def get_queryset(self):
        return Application.objects.filter(user=self.request.user)

class ApplicationUpdateView(generics.UpdateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'
    
    def get_queryset(self):
        return Application.objects.filter(user=self.request.user)

class ApplicationDeleteView(generics.DestroyAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'
    
    def get_queryset(self):
        return Application.objects.filter(user=self.request.user)

class CheckEligibilityView(APIView):
    def post(self, request):
        serializer = EligibilityCheckSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        
        try:
            # Get job by integer ID
            job = Job.objects.get(id=serializer.validated_data['job'])
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)
        
        # Initialize CV analyzer and skill matcher
        cv_analyzer = CVAnalyzer()
        skill_matcher = SkillMatcher()
        
        try:
            # Extract CV file from validated data
            cv_file = serializer.validated_data['cv']
            # Analyze CV
            cv_analysis = cv_analyzer.analyze_cv(cv_file)
            if "error" in cv_analysis:
                return Response(cv_analysis, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate match score
            match_result = skill_matcher.calculate_match_score(cv_analysis, job)
            match_score = match_result['match_score']
            missing_skills = match_result['missing_skills']
            
            response_data = {
                "match_score": round(match_score, 2),
                "eligible": match_score >= 70,
                "missing_skills": missing_skills if missing_skills else []
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in CV analysis: {str(e)}")
            return Response(
                {"error": "Failed to analyze CV. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ScheduleInterviewView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, format=None):
        """Schedule an interview for a job application"""
        serializer = ScheduleInterviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        cv_file = serializer.validated_data['cv']
        job_id = serializer.validated_data['job']
        interview_date = serializer.validated_data['interview_date']
        interview_time = serializer.validated_data['interview_time']
        
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Analyze CV and calculate match score
        cv_analyzer = CVAnalyzer()
        skill_matcher = SkillMatcher()
        
        try:
            cv_analysis = cv_analyzer.analyze_cv(cv_file)
            if "error" in cv_analysis:
                return Response(cv_analysis, status=status.HTTP_400_BAD_REQUEST)
            
            match_result = skill_matcher.calculate_match_score(cv_analysis, job)
            match_score = match_result['match_score']
            missing_skills = match_result['missing_skills']
            
            # Check if the match score meets the threshold
            if match_score < 70:
                return Response({
                    "error": "Your profile doesn't match the job requirements",
                    "match_score": round(match_score, 2),
                    "missing_skills": ", ".join(missing_skills) if missing_skills else None
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create application with scheduled interview
            application = Application(
                user=request.user,
                job=job,
                cv=cv_file,
                match_score=match_score,
                missing_skills=", ".join(missing_skills) if missing_skills else None,
                status='scheduled',
                interview_date=interview_date,
                interview_time=interview_time
            )
            application.save()
            
            return Response(
                ApplicationSerializer(application).data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Error scheduling interview: {str(e)}")
            return Response(
                {"error": "Failed to schedule interview. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserApplicationsView(generics.ListAPIView):
    """View to list all applications for the current user (redundant with ApplicationListView but included for completeness)"""
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Application.objects.filter(user=self.request.user)