from django.urls import path
from .views import  GenerateQuizAPIView

urlpatterns = [
    
    path('interrupt-quiz/', GenerateQuizAPIView.as_view(), name='generate-quiz'),
]
