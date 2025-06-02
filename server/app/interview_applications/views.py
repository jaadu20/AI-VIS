# applications/views.py
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
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

logger = logging.getLogger(__name__)

def process_application_sync(application):
    """Process application synchronously instead of using Celery"""
    try:
        # Perform any additional processing here
        application.status = 'pending'  # Keep as pending initially
        application.save()
        logger.info(f"Application {application.id} processed successfully")
    except Exception as e:
        logger.error(f"Error processing application {application.id}: {str(e)}")
        raise

class ApplicationCreateView(generics.CreateAPIView):
    serializer_class = ApplicationCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """Create a new application"""
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        cv_file = serializer.validated_data['cv']
        job = serializer.validated_data['job']  # Directly get the Job instance
        
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
            if match_score < 60:
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
            
            # Process application synchronously instead of using Celery
            process_application_sync(application)
            
            return Response({"id": str(application.id)}, status=status.HTTP_201_CREATED)
            
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
    queryset = Application.objects.all()
    lookup_field = 'pk'
    permission_classes = [AllowAny]

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
            # Get job using integer ID directly
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
                "eligible": match_score >= 60,
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
    def post(self, request, format=None):
        serializer = ScheduleInterviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        
        try:
            # Get job using integer ID
            job = Job.objects.get(id=serializer.validated_data['job'])
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)
            
        
        cv_file = serializer.validated_data['cv']
        interview_date = serializer.validated_data['interview_date']
        interview_time = serializer.validated_data['interview_time']
        
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
    
class AllApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    queryset = Application.objects.all()
    permission_classes = [AllowAny] 