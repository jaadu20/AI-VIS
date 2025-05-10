from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from .models import Application
from .serializers import ApplicationSerializer, ApplicationCreateSerializer
from jobs.models import Job
from .services import CVAnalyzer, EligibilityCalculator

DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB

class ApplicationCreateView(generics.CreateAPIView):
    serializer_class = ApplicationCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]

    def create(self, request, *args, **kwargs):
        if request.user.role != 'candidate':
            return Response(
                {"error": "Only candidates can apply for jobs"},
                status=status.HTTP_403_FORBIDDEN
            )

        job_id = request.data.get('job')
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response(
                {"error": "Job not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        if Application.objects.filter(candidate=request.user, job=job).exists():
            return Response(
                {"error": "You've already applied for this position"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            analyzer = CVAnalyzer()
            calculator = EligibilityCalculator()

            # Process CV
            cv_text = analyzer.extract_text(request.FILES['cv'])
            cv_skills = analyzer.extract_skills(cv_text)
            
            # Analyze job requirements
            job_skills = analyzer.analyze_job_requirements(job)
            
            # Calculate eligibility
            match_score, missing_skills = calculator.calculate_match(cv_skills, job_skills)
            
            # Create application
            application = Application.objects.create(
                candidate=request.user,
                job=job,
                cv=request.FILES['cv'],
                match_score=match_score,
                missing_skills=", ".join(missing_skills),
                status='interviewing' if match_score >= 70 else 'rejected',
                raw_analysis={
                    'cv_text': cv_text,
                    'cv_skills': cv_skills,
                    'job_skills': job_skills
                }
            )

            response_data = ApplicationSerializer(application).data
            response_data['eligible'] = match_score >= 70

            return Response(response_data, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"CV analysis failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(candidate=self.request.user)