from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .jarvis import simplify_text

def index(request):
    return JsonResponse({"message": "Welcome to the AI Text Simplifier!"})

@csrf_exempt
def simplify(request):
    if request.method == "GET":
        text = request.GET.get("text", "").strip()
    else:  # POST request (recommended from React Native)
        try:
            body = json.loads(request.body.decode("utf-8"))
            text = body.get("text", "").strip()
        except Exception:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    if not text:
        return JsonResponse({"error": "No text provided"}, status=400)

    simplified = simplify_text(text)
    return JsonResponse({"original_text": text, "simplified_text": simplified})