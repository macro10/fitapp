# backend/workouts/analytics.py

from datetime import datetime, timedelta
from django.db.models import F, Sum
from django.db.models.functions import ExtractWeek, ExtractYear
from django.utils import timezone
from .models import Workout, PerformedExercise

def calculate_volume_per_set(performed_exercise):
    """Calculate total volume for a performed exercise"""
    volume = 0
    for reps, weight in zip(performed_exercise.reps_per_set, 
                          performed_exercise.weights_per_set or [0] * len(performed_exercise.reps_per_set)):
        volume += reps * (weight or 0)  # handle None weights as 0
    return volume

def get_weekly_volume_data(user, start_date=None, end_date=None):
    """Get weekly workout volume data for a user"""
    # Default to last 6 months if no dates provided
    if not end_date:
        end_date = timezone.now()
    if not start_date:
        start_date = end_date - timedelta(days=180)

    # Get all workouts in date range
    workouts = Workout.objects.filter(
        user=user,
        date__range=(start_date, end_date)
    ).prefetch_related('performed_exercises')

    # Initialize weekly volume dictionary
    weekly_volumes = {}

    for workout in workouts:
        # Get the ISO week number and year
        year = workout.date.isocalendar()[0]
        week = workout.date.isocalendar()[1]
        week_key = f"{year}-W{week:02d}"

        # Calculate total volume for this workout
        workout_volume = 0
        for performed_exercise in workout.performed_exercises.all():
            workout_volume += calculate_volume_per_set(performed_exercise)

        # Add to weekly totals and count
        if week_key not in weekly_volumes:
            weekly_volumes[week_key] = {
                'total_volume': 0,
                'workout_count': 0
            }
        weekly_volumes[week_key]['total_volume'] += workout_volume
        weekly_volumes[week_key]['workout_count'] += 1

    # Calculate averages and format response
    formatted_data = []
    for week_key, data in sorted(weekly_volumes.items()):
        avg_volume = data['total_volume'] / data['workout_count']
        formatted_data.append({
            'week': week_key,
            'avgVolumePerWorkout': round(avg_volume, 2),
            'totalVolume': round(data['total_volume'], 2),
            'workoutCount': data['workout_count']
        })

    return formatted_data