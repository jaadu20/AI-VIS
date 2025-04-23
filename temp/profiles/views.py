from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import CandidateProfileSerializer, CandidateProfileUpdateSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import CandidateProfile


class CandidateProfileView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.candidate_profile
            serializer = CandidateProfileSerializer(profile)
            return Response(serializer.data)
        except CandidateProfile.DoesNotExist:
            return Response(
                {"detail": "Candidate profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    def patch(self, request):
        try:
            profile = request.user.candidate_profile
            serializer = CandidateProfileUpdateSerializer(
                profile, 
                data=request.data,
                partial=True
            )
            
            if serializer.is_valid():
                # Handle file uploads
                if 'cv' in request.FILES:
                    profile.cv = request.FILES['cv']
                if 'cover_letter' in request.FILES:
                    profile.cover_letter = request.FILES['cover_letter']
                if 'image' in request.FILES:
                    profile.image = request.FILES['image']
                
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except CandidateProfile.DoesNotExist:
            return Response(
                {"detail": "Candidate profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )