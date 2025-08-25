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
from .permissions.permissions import IsOwnerOfWorkout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .analytics import get_weekly_volume_data
from datetime import datetime

# Create your views here.
class ExerciseViewSet(viewsets.ModelViewSet):
    """
    retrieve:
    Return the given exercise.

    list:
    Return a list of all exercises.

    create:
    Create a new exercise.

    update:
    Update an existing exercise.

    partial_update:
    Partially update an existing exercise.

    destroy:
    Delete an exercise.
    """
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]
    queryset = Exercise.objects.all()

    def get_queryset(self):
        return ExerciseService.get_all_exercises()

    def perform_create(self, serializer):
        ExerciseService.create_exercise(serializer.validated_data)

class WorkoutViewSet(viewsets.ModelViewSet):
    """
    retrieve:
    Return the given workout.

    list:
    Return a list of all workouts for the authenticated user.

    create:
    Create a new workout for the authenticated user.

    update:
    Update an existing workout.

    partial_update:
    Partially update an existing workout.

    destroy:
    Delete a workout.
    """
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated]
    queryset = Workout.objects.all()

    def get_queryset(self):
        return WorkoutService.get_user_workouts(self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PerformedExerciseViewSet(viewsets.ModelViewSet):
    """
    retrieve:
    Return the given performed exercise.

    list:
    Return a list of all performed exercises for the authenticated user.

    create:
    Add a performed exercise to a workout owned by the authenticated user.

    update:
    Update a performed exercise.

    partial_update:
    Partially update a performed exercise.

    destroy:
    Delete a performed exercise.
    """
    serializer_class = PerformedExerciseSerializer
    permission_classes = [IsAuthenticated, IsOwnerOfWorkout]
    queryset = PerformedExercise.objects.all()

    def get_queryset(self):
        return PerformedExerciseService.get_user_performed_exercises(self.request.user)

    def perform_create(self, serializer):
        PerformedExerciseService.create_performed_exercise(serializer.validated_data)

class UserRegistrationView(generics.CreateAPIView):
    """
    create:
    Register a new user account.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_volume_analytics(request):
    # Get date range from query params if provided
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    # Parse dates if provided
    if start_date:
        start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    if end_date:
        end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

    data = get_weekly_volume_data(
        user=request.user,
        start_date=start_date,
        end_date=end_date
    )

    return Response({
        'weekly_volumes': data
    })