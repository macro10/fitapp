from ..models import Exercise
from typing import List
from ..exceptions.exceptions import ExerciseNotFoundError

class ExerciseService:
    @staticmethod
    def get_all_exercises() -> List[Exercise]:
        """
        Get all available exercises
        """
        return Exercise.objects.all()
    
    @staticmethod
    def create_exercise(data: dict) -> Exercise:
        """
        Create a new exercise
        """
        return Exercise.objects.create(**data)
    
    @staticmethod
    def get_exercise_by_id(exercise_id: int) -> Exercise:
        """
        Get a specific exercise by ID
        """
        try:
            return Exercise.objects.get(id=exercise_id)
        except Exercise.DoesNotExist:
            raise ExerciseNotFoundError()