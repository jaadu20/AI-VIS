from rest_framework import viewsets, permissions
from .models import JobPosting
from .serializers import JobPostingSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class JobPostingViewSet(viewsets.ModelViewSet):
    serializer_class = JobPostingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobPosting.objects.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user)