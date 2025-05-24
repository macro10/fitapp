from rest_framework import permissions
from ..services.performed_exercise_service import PerformedExerciseService

class IsOwnerOfWorkout(permissions.BasePermission):
    """
    Custom permission to only allow owners of a workout to add performed exercises.
    """

    def has_permission(self, request, view):
        # Allow safe methods (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
        return True  # We'll do object-level check in has_object_permission

    def has_object_permission(self, request, view, obj):
        # Only allow if the user owns the workout
        if hasattr(obj, 'workout'):
            workout = obj.workout
        else:
            workout = obj
        return PerformedExerciseService.verify_workout_ownership(workout, request.user)
