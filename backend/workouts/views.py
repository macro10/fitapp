from django.shortcuts import render
from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Exercise, Workout, PerformedExercise
from .serializers import (
    ExerciseSerializer, 
    WorkoutSerializer, 
    PerformedExerciseSerializer, 
    UserRegistrationSerializer
)
from django.contrib.auth.models import User
from .services.workout_service import WorkoutService
from .services.exercise_service import ExerciseService
from .services.performed_exercise_service import PerformedExerciseService

# Create your views here.
class ExerciseViewSet(viewsets.ModelViewSet):
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]
    queryset = Exercise.objects.all()

    def get_queryset(self):
        return ExerciseService.get_all_exercises()

    def perform_create(self, serializer):
        ExerciseService.create_exercise(serializer.validated_data)

class WorkoutViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated]
    queryset = Workout.objects.all()

    def get_queryset(self):
        return WorkoutService.get_user_workouts(self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PerformedExerciseViewSet(viewsets.ModelViewSet):
    serializer_class = PerformedExerciseSerializer
    permission_classes = [IsAuthenticated]
    queryset = PerformedExercise.objects.all()

    def get_queryset(self):
        return PerformedExerciseService.get_user_performed_exercises(self.request.user)

    def perform_create(self, serializer):
        workout = serializer.validated_data['workout']
        if not PerformedExerciseService.verify_workout_ownership(workout, self.request.user):
            raise PermissionError("You can only add exercises to your own workouts")
        PerformedExerciseService.create_performed_exercise(workout, serializer.validated_data)

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]