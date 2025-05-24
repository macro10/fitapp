from ..models import Workout
from django.contrib.auth.models import User
from typing import List

class WorkoutService:
    @staticmethod
    def get_user_workouts(user: User) -> List[Workout]:
        """
        Get all workouts for a specific user
        """
        return Workout.objects.filter(user=user)
    
    @staticmethod
    def create_workout(user: User, data: dict) -> Workout:
        """
        Create a new workout for a user
        """
        return Workout.objects.create(user=user, **data)
    
    @staticmethod
    def get_workout_by_id(workout_id: int, user: User) -> Workout:
        """
        Get a specific workout by ID, ensuring it belongs to the user
        """
        return Workout.objects.get(id=workout_id, user=user)