from .models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):

    def validate(self, attrs):
        role = attrs.get('role')
        
        # Company validation
        if role == 'company':
            missing_fields = []
            if not attrs.get('company_name'):
                missing_fields.append('company_name')
            if not attrs.get('company_address'):
                missing_fields.append('company_address')
            
            if missing_fields:
                raise serializers.ValidationError({
                    "detail": f"Missing fields for company: {', '.join(missing_fields)}"
                })
        return attrs
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'name', 'phone', 'role', 'company_name', 'company_address']
        extra_kwargs = {
            'password': {'write_only': True},
            'company_name': {'required': False},
            'company_address': {'required': False},
        }

    def validate(self, attrs):
        role = attrs.get('role')

        # Company validation
        if role == 'company':
            missing_fields = []
            if not attrs.get('company_name'):
                missing_fields.append('company_name')
            if not attrs.get('company_address'):
                missing_fields.append('company_address')
            
            if missing_fields:
                raise serializers.ValidationError({
                    "detail": f"Missing fields for company: {', '.join(missing_fields)}"
                })

        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            role=validated_data['role'],
            phone=validated_data['phone'],
            company_name=validated_data.get('company_name', ''),
            company_address=validated_data.get('company_address', ''),
        )
        return user

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            self.user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist")
        return value

    def save(self):
        user = self.user
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        
        send_mail(
            "Password Reset Request",
            f"Click the link to reset your password: {reset_link}",
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)
    uidb64 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs['uidb64']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError("Invalid reset link")

        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError("Invalid reset token")

        self.user = user
        return attrs

    def save(self):
        user = self.user
        user.set_password(self.validated_data['password'])
        user.save()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        token['name'] = user.name
        token['phone'] = user.phone
        
        if user.role == 'company':
            token['company_name'] = user.company_name
            token['company_address'] = user.company_address
            
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Include user details in the response
        user = self.user
        user_data = {
            'email': user.email,
            'role': user.role,
            'name': user.name,
            'phone': user.phone
        }
        
        if user.role == 'company':
            user_data['company_name'] = user.company_name
            user_data['company_address'] = user.company_address
            
        data['user'] = user_data
        return data