from ..models import PerformedExercise, Workout
from django.contrib.auth.models import User
from typing import List

class PerformedExerciseService:
    @staticmethod
    def get_user_performed_exercises(user: User) -> List[PerformedExercise]:
        """
        Get all performed exercises for a user's workouts
        """
        return PerformedExercise.objects.filter(workout__user=user)
    
    @staticmethod
    def create_performed_exercise(workout: Workout, data: dict) -> PerformedExercise:
        """
        Create a new performed exercise for a workout
        """
        data = data.copy()
        data.pop('workout', None)
        return PerformedExercise.objects.create(workout=workout, **data)
    
    @staticmethod
    def verify_workout_ownership(workout: Workout, user: User) -> bool:
        """
        Verify that a workout belongs to the specified user
        """
        return workout.user == user