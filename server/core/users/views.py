import random
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
from django.utils.encoding import force_bytes, force_str
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .serializers import (
    SignupSerializer,
    MyTokenObtainPairSerializer,
    ForgotPasswordSerializer,
)
from .models import PasswordReset

User = get_user_model()


class SignupView(generics.CreateAPIView):
    """
    POST /api/auth/signup/
    Registers a new user. Username is automatically set to the email if not provided.
    """
    serializer_class = SignupSerializer

    def create(self, request, *args, **kwargs):
        # Call the serializer's create() method and return a 201 status
        response = super().create(request, *args, **kwargs)
        return Response(response.data, status=status.HTTP_201_CREATED)


# Login view using SimpleJWT with a custom token serializer
from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Returns a JWT access token with custom claims (id, email, role, name, phone, etc.).
    """
    serializer_class = MyTokenObtainPairSerializer


class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/
    Accepts an email address and sends a password reset code or link.
    """
    serializer_class = ForgotPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "User with this email does not exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate a random six-digit code
        code = str(random.randint(100000, 999999))
        PasswordReset.objects.create(user=user, code=code)

        # Also generate uidb64 and token for a link-based reset flow
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Send the reset code/link via email
        send_mail(
        "Password Reset Request",
        f"Your password reset code is: {code}\n\n"
        f"Or reset your password using the link below:\n"
        f"http://localhost:5174/resetpassword/{uidb64}/{token}",
        "jawadgfarid383@gmail.com",  # Use the same email as EMAIL_HOST_USER if testing with Gmail
        [email],
        fail_silently=False,
    )

        return Response(
            {"detail": "Password reset email sent! Check your inbox."},
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(APIView):
    def post(self, request):
        uidb64 = request.data.get("uidb64")
        token = request.data.get("token")
        new_password = request.data.get("password")

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"detail": "Invalid reset link"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        # Delete all existing password resets for this user
        PasswordReset.objects.filter(user=user).delete()
        
        return Response(
            {"detail": "Password reset successful"},
            status=status.HTTP_200_OK
        )