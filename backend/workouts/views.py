from django.shortcuts import render
from rest_framework import viewsets
from .models import Exercise, Workout, PerformedExercise
from .serializers import ExerciseSerializer, WorkoutSerializer, PerformedExerciseSerializer


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
