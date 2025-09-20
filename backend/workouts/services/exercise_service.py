from ..models import Exercise
from typing import List
from ..exceptions.exceptions import ExerciseNotFoundError
from django.db.models import Q

class ExerciseService:
    @staticmethod
    def get_user_exercises(user) -> List[Exercise]:
        """
        Global exercises (owner is NULL) plus this user's custom ones
        """
        return Exercise.objects.filter(Q(owner__isnull=True) | Q(owner=user))

    @staticmethod
    def create_exercise(data: dict) -> Exercise:
        """
        Create a new exercise
        """
        return Exercise.objects.create(**data)

    @staticmethod
    def get_exercise_by_id(exercise_id: int) -> Exercise:
        try:
            return Exercise.objects.get(id=exercise_id)
        except Exercise.DoesNotExist:
            raise ExerciseNotFoundError()