from rest_framework.exceptions import APIException
from rest_framework import status

class WorkoutNotFoundError(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Workout not found.'
    default_code = 'workout_not_found'

class ExerciseNotFoundError(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Exercise not found.'
    default_code = 'exercise_not_found'

class PerformedExerciseNotFoundError(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Performed exercise not found.'
    default_code = 'performed_exercise_not_found'

class WorkoutPermissionError(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'You do not have permission to access this workout.'
    default_code = 'workout_permission_denied'

class InvalidWorkoutDataError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid workout data provided.'
    default_code = 'invalid_workout_data'

class InvalidExerciseDataError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid exercise data provided.'
    default_code = 'invalid_exercise_data'