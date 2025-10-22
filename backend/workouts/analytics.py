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

def get_top_workouts_by_volume(user, limit=5):
    """Get the top workouts by total volume for a user"""
    workouts = Workout.objects.filter(user=user).prefetch_related('performed_exercises')
    
    # Calculate volume for each workout
    workout_volumes = []
    for workout in workouts:
        total_volume = 0
        for performed_exercise in workout.performed_exercises.all():
            total_volume += calculate_volume_per_set(performed_exercise)
            
        workout_volumes.append({
            'id': workout.id,
            'date': workout.date,
            'name': workout.name,
            'total_volume': total_volume,
            'exercise_count': workout.performed_exercises.count()
        })
    
    # Sort by volume and get top N
    sorted_workouts = sorted(workout_volumes, key=lambda x: x['total_volume'], reverse=True)[:limit]
    
    return sorted_workouts

def get_weekly_workout_frequency(user, start_date=None, end_date=None):
    """Get weekly workout frequency (count of workouts) for a user"""
    if not end_date:
        end_date = timezone.now()
    if not start_date:
        start_date = end_date - timedelta(days=180)

    workouts = Workout.objects.filter(
        user=user,
        date__range=(start_date, end_date)
    ).only('date')

    weekly_counts = {}
    for workout in workouts:
        year, week, _ = workout.date.isocalendar()
        week_key = f"{year}-W{week:02d}"
        weekly_counts[week_key] = weekly_counts.get(week_key, 0) + 1

    # Format and sort by week key ascending
    formatted = []
    for week_key, count in sorted(weekly_counts.items()):
        formatted.append({
            'week': week_key,
            'workoutCount': count,
        })
    return formatted

# --- Muscle group analytics ---

from collections import defaultdict
from .models import Exercise

def _week_start(dt):
    return dt - timedelta(days=dt.weekday())

def _all_groups():
    # Use defined choices from Exercise to keep a canonical list
    return [k for k, _ in Exercise.MUSCLE_GROUPS]

def _empty_group_dict():
    return {g: 0 for g in _all_groups()}

def weekly_group_aggregation(user, start_date=None, end_date=None, weeks=12):
    """
    Returns a list of weekly rows with volume and session counts per muscle group.
    Each row:
      {
        "weekStart": "YYYY-MM-DD",
        "groups": {"legs": 22000, ...},
        "sessions": {"legs": 2, ...},   # unique workouts containing that group
        "total": 54000
      }
    """
    if not end_date:
        end_date = timezone.now()
    if not start_date:
        start_date = end_date - timedelta(weeks=weeks)

    qs = (PerformedExercise.objects
          .select_related('workout', 'exercise')
          .filter(workout__user=user,
                  workout__date__gte=start_date,
                  workout__date__lt=end_date)
          .only('reps_per_set', 'weights_per_set', 'exercise__muscle_group', 'workout__date', 'workout_id'))

    weekly_volumes = defaultdict(lambda: _empty_group_dict())
    weekly_sessions = defaultdict(lambda: {g: set() for g in _all_groups()})

    for pe in qs:
        g = pe.exercise.muscle_group or 'core'
        ws = _week_start(pe.workout.date).date()
        vol = calculate_volume_per_set(pe)
        weekly_volumes[ws][g] += vol
        weekly_sessions[ws][g].add(pe.workout_id)

    rows = []
    for ws in sorted(weekly_volumes.keys()):
        groups = weekly_volumes[ws]
        sessions = {g: len(weekly_sessions[ws][g]) for g in _all_groups()}
        rows.append({
            "weekStart": ws.isoformat(),
            "groups": groups,
            "sessions": sessions,
            "total": int(sum(groups.values()))
        })
    return rows

def current_vs_last_week_by_group(user):
    """
    Compares this ISO week (Mon->now) vs last week for each muscle group.
    """
    now = timezone.now()
    start_this = _week_start(now)
    start_last = start_this - timedelta(days=7)
    end_last = start_this

    def summarize(rows):
        totals = _empty_group_dict()
        for r in rows:
            for g, v in r["groups"].items():
                totals[g] += v
        return totals

    this_rows = weekly_group_aggregation(user, start_this, now, weeks=1)
    last_rows = weekly_group_aggregation(user, start_last, end_last, weeks=1)

    this_totals = summarize(this_rows)
    last_totals = summarize(last_rows)

    delta_pct = {}
    for g in _all_groups():
        last = last_totals.get(g, 0) or 0
        this = this_totals.get(g, 0) or 0
        if last == 0:
            delta_pct[g] = None if this == 0 else 100.0
        else:
            delta_pct[g] = round(((this - last) / last) * 100.0, 2)

    top_group = max(_all_groups(), key=lambda g: this_totals.get(g, 0))

    return {
        "this": this_totals,
        "last": last_totals,
        "deltaPct": delta_pct,
        "topGroup": top_group,
        "totalThis": int(sum(this_totals.values())),
        "totalLast": int(sum(last_totals.values()))
    }

def balance_scores(user, weeks=8, current_window=2, threshold=0.2):
    """
    Computes baseline share over the last `weeks` and compares with the most recent
    `current_window` weeks. Returns per-group status: 'undertrained' | 'overemphasized' | 'ok'.
    """
    rows = weekly_group_aggregation(user, weeks=weeks)
    if not rows:
        return {"baselineShare": _empty_group_dict(), "currentShare": _empty_group_dict(), "status": {g: "ok" for g in _all_groups()}}

    # Baseline over the full window
    baseline_totals = _empty_group_dict()
    baseline_total_all = 0
    for r in rows:
        for g, v in r["groups"].items():
            baseline_totals[g] += v
            baseline_total_all += v
    baseline_share = {g: (baseline_totals[g] / baseline_total_all) if baseline_total_all else 0 for g in _all_groups()}

    # Current recent window (last K weeks)
    recent = rows[-current_window:] if current_window > 0 else rows[-1:]
    current_totals = _empty_group_dict()
    current_total_all = 0
    for r in recent:
        for g, v in r["groups"].items():
            current_totals[g] += v
            current_total_all += v
    current_share = {g: (current_totals[g] / current_total_all) if current_total_all else 0 for g in _all_groups()}

    status = {}
    for g in _all_groups():
        b = baseline_share[g]
        c = current_share[g]
        if b == 0 and c == 0:
            status[g] = "ok"
        elif c > b * (1 + threshold):
            status[g] = "overemphasized"
        elif c < b * (1 - threshold):
            status[g] = "undertrained"
        else:
            status[g] = "ok"

    return {
        "baselineShare": {g: round(baseline_share[g], 4) for g in _all_groups()},
        "currentShare": {g: round(current_share[g], 4) for g in _all_groups()},
        "status": status
    }

def recency_days_by_group(user):
    """
    Days since last time each muscle group was trained.
    """
    now = timezone.now()
    latest_seen = {g: None for g in _all_groups()}

    qs = (PerformedExercise.objects
          .select_related('workout', 'exercise')
          .filter(workout__user=user)
          .only('exercise__muscle_group', 'workout__date')
          .order_by('-workout__date'))

    for pe in qs:
        g = pe.exercise.muscle_group or 'core'
        if latest_seen[g] is None:
            latest_seen[g] = pe.workout.date
        if all(dt is not None for dt in latest_seen.values()):
            break

    recency = {}
    for g in _all_groups():
        if latest_seen[g] is None:
            recency[g] = None
        else:
            recency[g] = max(0, (now - latest_seen[g]).days)
    return recency

def muscle_groups_summary(user, weeks=12, current_window=2, threshold=0.2):
    weekly = weekly_group_aggregation(user, weeks=weeks)
    current_last = current_vs_last_week_by_group(user)
    balance = balance_scores(user, weeks=weeks, current_window=current_window, threshold=threshold)
    recency = recency_days_by_group(user)
    return {
        "weekly": weekly,
        "currentVsLast": current_last,
        "balance": balance,
        "recencyDays": recency
    }