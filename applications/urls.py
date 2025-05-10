from django.urls import path
from .views import ApplicationCreateView, ApplicationListView

urlpatterns = [
    path('', ApplicationCreateView.as_view(), name='application-create'),
    path('mine/', ApplicationListView.as_view(), name='my-applications'),
]