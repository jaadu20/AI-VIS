from django.contrib import admin
from django.urls import path, include
from frontend.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('frontend.urls')),
    path('api/auth/register/', CreateUserView.as_view(), name='register'),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='get_token'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='refresh'), 
    path('api-auth',include('rest_framework.urls')),
]
