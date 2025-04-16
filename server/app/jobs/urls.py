from django.urls import path
from .views import JobPostingViewSet

urlpatterns = [
    path('jobs/', JobPostingViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('jobs/<int:pk>/', JobPostingViewSet.as_view({
        'get': 'retrieve', 
        'put': 'update',
        'delete': 'destroy'
    })),
]