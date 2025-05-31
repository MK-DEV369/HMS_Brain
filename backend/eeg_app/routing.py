from django.urls import re_path
from eeg_app.consumers import EEGConsumer

websocket_urlpatterns = [
    re_path(r'ws/eeg/(?P<patient_id>[^/]+)/$', EEGConsumer.as_asgi()),
]
