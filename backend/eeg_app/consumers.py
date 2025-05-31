# backend/eeg_app/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class EEGConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.patient_id = self.scope['url_route']['kwargs']['patient_id']
        self.room_group_name = f"eeg_{self.patient_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"WebSocket connected for {self.patient_id}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"WebSocket disconnected for {self.patient_id}")

    async def receive(self, text_data):
        print("Received:", text_data)
        # Optionally parse and process EEG data

    # Optional: Send data from backend
    async def send_eeg_data(self, event):
        await self.send(text_data=json.dumps(event["data"]))
