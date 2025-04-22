from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Job
from .serializers import JobSerializer
from .permissions import IsCompanyUser
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.pagination import PageNumberPagination

class JobCreateView(generics.CreateAPIView):
    authentication_classes = [JWTAuthentication] 
    permission_classes = [IsAuthenticated, IsCompanyUser]
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    def create(self, request, *args, **kwargs):
        print(f"Auth User: {request.user.email}")  # Debug log
        return super().create(request, *args, **kwargs)

class CompanyJobListView(generics.ListAPIView):
    pagination_class = PageNumberPagination
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsCompanyUser]

    def get_queryset(self):
        return Job.objects.filter(company=self.request.user)

class JobListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = JobSerializer
    pagination_class = None  
    
    def get_queryset(self):
        return Job.objects.all() \
            .order_by('-created_at') \
            .select_related('company__company_profile')