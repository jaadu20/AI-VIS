import json
from channels.generic.websocket import AsyncWebsocketConsumer

class InterviewConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.interview_id = self.scope['url_route']['kwargs']['interview_id']
        await self.channel_layer.group_add(
            f"interview_{self.interview_id}",
            self.channel_name
        )
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Process real-time audio/video streams
        await self.send(text_data=json.dumps({
            'type': 'processing_update',
            'message': 'Answer received'
        }))