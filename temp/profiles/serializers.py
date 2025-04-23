from rest_framework import serializers
from django.contrib.auth import get_user_model
from users.models import CandidateProfile

User = get_user_model()

class CandidateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateProfile
        fields = '__all__'
        read_only_fields = ('user',)

class CandidateProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateProfile
        fields = '__all__'
        extra_kwargs = {
            'cv': {'required': False},
            'cover_letter': {'required': False},
            'image': {'required': False}
        }