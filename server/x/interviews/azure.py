import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response

AZURE_SPEECH_KEY = "1JJ3FlHJyQWky4QtvopDo2MF94FXoXYryKTSglxwNg1DfAZRuJ48JQQJ99BCACYeBjFXJ3w3AAAYACOGJfEf"
AZURE_REGION = "eastus"

@api_view(['POST'])
def speech_to_text(request):
    # Assume audio file is sent in the request
    audio_file = request.FILES.get("audio")
    if not audio_file:
        return Response({"error": "No audio file provided"}, status=400)

    # Call Azure Speech API (this is pseudocode; refer to the official docs)
    headers = {
        "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
        "Content-Type": "audio/wav"
    }
    azure_url = f"https://{AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1"
    response = requests.post(azure_url, headers=headers, data=audio_file)

    if response.status_code != 200:
        return Response({"error": "Speech recognition failed"}, status=response.status_code)

    result = response.json()
    # Extract the recognized text from the result JSON
    recognized_text = result.get("DisplayText", "")
    return Response({"transcript": recognized_text}, status=200)
