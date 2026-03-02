import json
import random
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

OPENROUTER_API_KEY = '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'
OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

MODEL_NAME = 'gpt-4o-mini'


class GenerateQuizAPIView(APIView):
    """
    Generate a quiz using AI based on topic passed from frontend
    """

    def get(self, request):
        topic = request.query_params.get('topic')  # get topic from frontend
        if not topic:
            return Response({'error': 'Topic not provided'}, status=status.HTTP_400_BAD_REQUEST)

        prompt = f"""
Generate 5 multiple-choice questions (A-D) about "{topic}".
Return strictly JSON like:
[
  {{
    "question": "Question text",
    "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
    "answer": "A"
  }}
]
"""

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {OPENROUTER_API_KEY}',
        }

        payload = {
            'model': MODEL_NAME,
            'messages': [{'role': 'user', 'content': prompt}],
            'temperature': 0.7,
            'max_tokens': 600,
        }

        try:
            response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()

            content = data.get('choices', [{}])[0].get('message', {}).get('content', '')

            # Parse AI response JSON
            try:
                quiz_list = json.loads(content)
            except json.JSONDecodeError:
                import re
                match = re.search(r'\[.*\]', content, re.DOTALL)
                if match:
                    quiz_list = json.loads(match.group())
                else:
                    return Response({'error': 'Failed to parse quiz JSON'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Format for frontend
            formatted_quiz = []
            for q in quiz_list:
                formatted_quiz.append({
                    'id': random.randint(1000, 9999),
                    'question': q['question'],
                    'option_a': q['options']['A'],
                    'option_b': q['options']['B'],
                    'option_c': q['options']['C'],
                    'option_d': q['options']['D'],
                    'answer': q['answer'],
                })

            # Return a single random question
            return Response(random.choice(formatted_quiz))

        except requests.RequestException as e:
            return Response(
                {'error': 'Failed to connect AI API', 'details': str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
