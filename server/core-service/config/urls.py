from django.contrib import admin
from django.urls import path
from users.views import SignupView
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/signup/', SignupView.as_view(), name='signup'),
    path('api/login/', TokenObtainPairView.as_view(), name='login'),
]