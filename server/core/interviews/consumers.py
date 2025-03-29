from channels.generic.websocket import AsyncWebsocketConsumer
import json

class InterviewConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        await self.channel_layer.group_add(
            self.session_id,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.session_id,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Handle incoming messages
        await self.channel_layer.group_send(
            self.session_id,
            {
                "type": "interview.message",
                "data": data
            }
        )

    async def interview_message(self, event):
        # Send messages to client
        await self.send(text_data=json.dumps(event["data"]))