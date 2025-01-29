import google.generativeai as genai
import os
from django.http import JsonResponse
from rest_framework.decorators import api_view

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@api_view(["GET"])
def get_cultural_fact(request):
    """Fetch a cultural history fact from Gemini API."""
    try:
        model = genai.GenerativeModel("gemini-pro")
        prompt = "Give me a fun or intriguing historical fact about bharatnatyam"
        response = model.generate_content(prompt)
        fact = response.text.strip() if response.text else "No fact available at the moment."
        return JsonResponse({"fact": fact}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
