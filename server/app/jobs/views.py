# jobs/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import JobPosting
from .serializers import JobPostingSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_job_postings(request):
    # Optionally, you can filter by parameters such as city or role
    queryset = JobPosting.objects.all()
    serializer = JobPostingSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_job_posting(request):
    # For companies, ensure the user is properly authenticated and has the company role.
    serializer = JobPostingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(company=request.user)  # Associate the posting with the current company user.
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
