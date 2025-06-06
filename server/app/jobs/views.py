from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Job
from .serializers import JobSerializer
from .permissions import IsCompanyUser
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status

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
            .prefetch_related('company')
    
class JobDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    lookup_field = 'pk' 

class JobsByCompanyView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = JobSerializer

    def get_queryset(self):
        company_id = self.kwargs['company_id']
        return Job.objects.filter(company__id=company_id).order_by('-created_at')
    
class JobUpdateView(generics.UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsCompanyUser]
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    def get_queryset(self):
        return self.queryset.filter(company=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

class JobDeleteView(generics.DestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsCompanyUser]
    queryset = Job.objects.all()
    
    def get_queryset(self):
        return self.queryset.filter(company=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({'message': 'Job deleted successfully'}, status=status.HTTP_204_NO_CONTENT)