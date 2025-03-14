from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'is_candidate', 'is_company', 'resume', 'company_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            is_candidate=validated_data.get('is_candidate', False),
            is_company=validated_data.get('is_company', False),
            company_name=validated_data.get('company_name', ''),
        )
        return user