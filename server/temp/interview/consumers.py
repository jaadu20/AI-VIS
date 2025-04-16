from channels.generic.websocket import AsyncWebsocketConsumer
import json

class InterviewConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.interview_id = self.scope['url_route']['kwargs']['interview_id']
        await self.channel_layer.group_add(
            self.interview_id,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.interview_id,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Handle real-time updates from frontend
        await self.channel_layer.group_send(
            self.interview_id,
            {
                'type': 'interview_update',
                'data': data
            }
        )

    async def interview_update(self, event):
        # Send updates to frontend
        await self.send(text_data=json.dumps(event['data']))