from django.contrib import admin
from django.urls import path, include
from users import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/jobs/', include('jobs.urls')),
    # path('api/interview/', include('interviews.urls')),
    path('api/', include('interview.urls')),
]