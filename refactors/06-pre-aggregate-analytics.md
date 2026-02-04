# Refactor: Pre-aggregate Analytics Data

**Priority:** Medium Impact | Medium Effort
**Do first if:** User base growing, analytics page slow, or adding muscle group analytics

## Current State

Analytics are computed on every request by iterating all workouts:

```python
# analytics.py
def get_weekly_volume_data(user, start_date=None, end_date=None):
    workouts = Workout.objects.filter(
        user=user,
        date__range=(start_date, end_date)
    ).prefetch_related('performed_exercises')

    for workout in workouts:
        for performed_exercise in workout.performed_exercises.all():
            workout_volume += calculate_volume_per_set(performed_exercise)
```

## Problems

1. **O(workouts × exercises)** on every page load
2. **No caching:** Same calculation repeated on every request
3. **Scales poorly:** 100 workouts × 5 exercises = 500 iterations per request
4. **Blocks new features:** Muscle group analytics would add another dimension

## Recommended Solution

Add a `WeeklyStats` model that gets updated when workouts change.

### Step 1: Create Stats Model

```python
# backend/workouts/models.py

class WeeklyStats(models.Model):
    """Pre-aggregated weekly statistics per user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weekly_stats')
    year = models.IntegerField()
    week = models.IntegerField()  # ISO week number

    # Volume metrics
    total_volume = models.IntegerField(default=0)
    workout_count = models.IntegerField(default=0)

    # Muscle group breakdown (for future feature)
    volume_by_muscle_group = models.JSONField(default=dict)
    # e.g., {"chest": 5000, "back": 4500, "legs": 8000, ...}

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'year', 'week']
        indexes = [
            models.Index(fields=['user', 'year', 'week']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.year}-W{self.week:02d}"

    @classmethod
    def get_or_create_for_date(cls, user, date):
        """Get or create stats for the week containing the given date."""
        year, week, _ = date.isocalendar()
        stats, _ = cls.objects.get_or_create(
            user=user,
            year=year,
            week=week,
            defaults={'total_volume': 0, 'workout_count': 0, 'volume_by_muscle_group': {}}
        )
        return stats

    def recalculate(self):
        """Recalculate stats from workouts in this week."""
        from django.utils import timezone
        from datetime import timedelta

        # Get start and end of ISO week
        jan4 = timezone.datetime(self.year, 1, 4)
        start_of_year = jan4 - timedelta(days=jan4.weekday())
        week_start = start_of_year + timedelta(weeks=self.week - 1)
        week_end = week_start + timedelta(days=7)

        workouts = Workout.objects.filter(
            user=self.user,
            date__gte=week_start,
            date__lt=week_end
        ).prefetch_related('performed_exercises__exercise')

        self.workout_count = workouts.count()
        self.total_volume = sum(w.total_volume for w in workouts)

        # Calculate muscle group breakdown
        muscle_volumes = {}
        for workout in workouts:
            for pe in workout.performed_exercises.all():
                muscle = pe.exercise.muscle_group
                volume = pe.calculate_volume()
                muscle_volumes[muscle] = muscle_volumes.get(muscle, 0) + volume

        self.volume_by_muscle_group = muscle_volumes
        self.save()
```

### Step 2: Update Stats on Workout Changes

```python
# backend/workouts/signals.py

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Workout, PerformedExercise, WeeklyStats

@receiver(post_save, sender=Workout)
def update_stats_on_workout_save(sender, instance, created, **kwargs):
    """Update weekly stats when a workout is saved."""
    stats = WeeklyStats.get_or_create_for_date(instance.user, instance.date)
    stats.recalculate()

@receiver(post_delete, sender=Workout)
def update_stats_on_workout_delete(sender, instance, **kwargs):
    """Update weekly stats when a workout is deleted."""
    stats = WeeklyStats.get_or_create_for_date(instance.user, instance.date)
    stats.recalculate()

@receiver([post_save, post_delete], sender=PerformedExercise)
def update_stats_on_exercise_change(sender, instance, **kwargs):
    """Update weekly stats when exercises change."""
    if instance.workout:
        stats = WeeklyStats.get_or_create_for_date(
            instance.workout.user,
            instance.workout.date
        )
        stats.recalculate()
```

### Step 3: Simplify Analytics Queries

```python
# backend/workouts/analytics.py

def get_weekly_volume_data(user, start_date=None, end_date=None):
    """Get weekly volume data from pre-aggregated stats."""
    if not end_date:
        end_date = timezone.now()
    if not start_date:
        start_date = end_date - timedelta(days=180)

    # Get year/week range
    start_year, start_week, _ = start_date.isocalendar()
    end_year, end_week, _ = end_date.isocalendar()

    # Query pre-aggregated stats
    stats = WeeklyStats.objects.filter(
        user=user,
    ).filter(
        models.Q(year__gt=start_year) |
        models.Q(year=start_year, week__gte=start_week)
    ).filter(
        models.Q(year__lt=end_year) |
        models.Q(year=end_year, week__lte=end_week)
    ).order_by('year', 'week')

    return [
        {
            'week': f"{s.year}-W{s.week:02d}",
            'totalVolume': s.total_volume,
            'workoutCount': s.workout_count,
            'avgVolumePerWorkout': (
                round(s.total_volume / s.workout_count, 2)
                if s.workout_count > 0 else 0
            ),
        }
        for s in stats
    ]


def get_muscle_group_stats(user, start_date=None, end_date=None):
    """Get muscle group volume distribution from pre-aggregated stats."""
    # ... similar query ...

    # Aggregate across weeks
    totals = {}
    for stats in weekly_stats:
        for muscle, volume in stats.volume_by_muscle_group.items():
            totals[muscle] = totals.get(muscle, 0) + volume

    total_volume = sum(totals.values())
    return {
        muscle: {
            'volume': volume,
            'percentage': round(volume / total_volume * 100, 1) if total_volume > 0 else 0
        }
        for muscle, volume in totals.items()
    }
```

### Step 4: Migration for Existing Data

```python
# backend/workouts/management/commands/rebuild_weekly_stats.py

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from workouts.models import Workout, WeeklyStats

class Command(BaseCommand):
    help = 'Rebuild all weekly stats from existing workouts'

    def handle(self, *args, **options):
        # Clear existing stats
        WeeklyStats.objects.all().delete()

        # Get all unique user/year/week combinations
        workouts = Workout.objects.all().select_related('user')

        processed = set()
        for workout in workouts:
            year, week, _ = workout.date.isocalendar()
            key = (workout.user_id, year, week)

            if key not in processed:
                stats = WeeklyStats.get_or_create_for_date(workout.user, workout.date)
                stats.recalculate()
                processed.add(key)

        self.stdout.write(
            self.style.SUCCESS(f'Rebuilt {len(processed)} weekly stats records')
        )
```

Run with:
```bash
python manage.py rebuild_weekly_stats
```

## Performance Comparison

### Before (Current)
```
GET /api/analytics/weekly-volume/
├── Query workouts (1 query)
├── Prefetch performed_exercises (1 query)
├── Loop: 100 workouts × 5 exercises = 500 iterations
└── Total: ~200ms for 6 months of data
```

### After (Pre-aggregated)
```
GET /api/analytics/weekly-volume/
├── Query WeeklyStats (1 query, ~26 rows for 6 months)
├── Loop: 26 iterations
└── Total: ~10ms for 6 months of data
```

## Benefits

1. **O(weeks) instead of O(workouts × exercises)**
2. **Muscle group analytics become trivial** - data already computed
3. **Faster page loads** - especially on mobile
4. **Enables new features:**
   - "Days since last trained [muscle]"
   - Balance score calculations
   - Year-over-year comparisons
   - Personal records tracking

## Trade-offs

1. **Storage:** Extra table with ~52 rows/user/year
2. **Write overhead:** Stats recalculated on workout changes
3. **Eventual consistency:** Rare edge case where stats might be stale

## Migration Steps

1. Create `WeeklyStats` model
2. Run `makemigrations` and `migrate`
3. Add signals for auto-update
4. Create management command for backfill
5. Run backfill on existing data
6. Update `analytics.py` to use new model
7. Add API endpoint for muscle group stats
8. Update frontend to use new data

## Future: Muscle Group Analytics

With `volume_by_muscle_group` pre-computed, the muscle group analytics feature becomes straightforward:

```python
# API endpoint
def get_muscle_group_summary(user):
    current_week = WeeklyStats.get_or_create_for_date(user, timezone.now())
    last_week = WeeklyStats.objects.filter(
        user=user,
        year=current_week.year,
        week=current_week.week - 1
    ).first()

    return {
        'current_week': current_week.volume_by_muscle_group,
        'last_week': last_week.volume_by_muscle_group if last_week else {},
        'balance_score': calculate_balance(current_week.volume_by_muscle_group),
    }
```
