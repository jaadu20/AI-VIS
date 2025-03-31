from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from .consumers import InterviewConsumer

application = ProtocolTypeRouter({
    "websocket": URLRouter([
        path("ws/interview/<str:session_id>/", InterviewConsumer.as_asgi()),
    ]),
})