from django.urls import path
from .views import get_cultural_fact

urlpatterns = [
    path('fact/', get_cultural_fact, name="get_cultural_fact"),
]
