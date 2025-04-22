import random
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
from django.utils.encoding import force_bytes, force_str
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView


from .serializers import (
    SignupSerializer,
    MyTokenObtainPairSerializer,
    ForgotPasswordSerializer,
)
from .models import PasswordReset

User = get_user_model()


class SignupView(generics.CreateAPIView):
    serializer_class = SignupSerializer
    permission_classes = [permissions.AllowAny]  # Add this line


# Login view using SimpleJWT with a custom token serializer
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class ForgotPasswordView(APIView):
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
        "mjconnect.solutions@gmail.com",  
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
        PasswordReset.objects.filter(user=user).delete()
        
        return Response(
            {"detail": "Password reset successful"},
            status=status.HTTP_200_OK
        )