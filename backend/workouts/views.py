from django.shortcuts import render
from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny
from .models import Exercise, Workout, PerformedExercise
from .serializers import ExerciseSerializer, WorkoutSerializer, PerformedExerciseSerializer, UserRegistrationSerializer
from django.contrib.auth.models import User

# Create your views here.
class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

class WorkoutViewSet(viewsets.ModelViewSet):
    queryset = Workout.objects.all()
    serializer_class = WorkoutSerializer

class PerformedExerciseViewSet(viewsets.ModelViewSet):
    queryset = PerformedExercise.objects.all()
    serializer_class = PerformedExerciseSerializer

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]