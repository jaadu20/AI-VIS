from rest_framework import serializers
from rest_framework.validators import UniqueValidator 
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from users.models import CandidateProfile, CompanyProfile
from django.db import IntegrityError

User = get_user_model()

class SignupSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[UniqueValidator(
            queryset=User.objects.all(),
            message="This email is already registered"
        )]
    )
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    company_address = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ("email", "password", "name", "phone", "role", "company_address")

    def validate(self, attrs):
        role = attrs.get('role')
        if role == 'company':
            if not attrs.get('name'):
                raise serializers.ValidationError({"name": "Company name is required"})
            if not attrs.get('company_address'):
                raise serializers.ValidationError({"company_address": "Company address is required"})
        return attrs

    def create(self, validated_data):
        company_address = validated_data.pop('company_address', None)
        
        try:
            user = User.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                name=validated_data['name'],
                phone=validated_data['phone'],
                role=validated_data['role']
            )
        except IntegrityError:
            raise serializers.ValidationError({"email": "This email is already registered"})

        if user.role == 'company':
            CompanyProfile.objects.create(
                user=user,
                company_name=validated_data['name'],
                company_address=company_address
            )
        else:
            CandidateProfile.objects.create(user=user)
            
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['id'] = str(user.id)
        token['email'] = user.email
        token['role'] = user.role
        token['name'] = user.name
        token['phone'] = user.phone
        
        if user.role == 'company':
            company = user.company_profile
            token['company_name'] = company.company_name
            token['company_address'] = company.company_address
            
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        
        data.update({
            'id': str(user.id),
            'email': user.email,
            'role': user.role,
            'name': user.name,
            'phone': user.phone
        })
        
        if user.role == 'company':
            company = user.company_profile
            data['company_name'] = company.company_name
            data['company_address'] = company.company_address
            
        return data

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
