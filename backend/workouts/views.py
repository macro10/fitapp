from django.shortcuts import render
from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Exercise, Workout, PerformedExercise
from .serializers import ExerciseSerializer, WorkoutSerializer, PerformedExerciseSerializer, UserRegistrationSerializer
from django.contrib.auth.models import User

# Create your views here.
class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]

class WorkoutViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated]
    queryset = Workout.objects.all()  # Base queryset, will be filtered in get_queryset

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PerformedExerciseViewSet(viewsets.ModelViewSet):
    serializer_class = PerformedExerciseSerializer
    permission_classes = [IsAuthenticated]
    queryset = PerformedExercise.objects.all()

    def get_queryset(self):
        return self.queryset.filter(workout__user=self.request.user)

    def perform_create(self, serializer):
        # Ensure the workout belongs to the current user
        workout = serializer.validated_data['workout']
        if workout.user != self.request.user:
            raise PermissionError("You can only add exercises to your own workouts")
        return super().perform_create(serializer)

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]