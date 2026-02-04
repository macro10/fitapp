# Refactor: Consolidate Volume Calculation

**Priority:** Medium Impact | Low Effort
**Do first if:** Adding new metrics soon

## Current State

Volume is calculated in 3+ places:

### Frontend - `useWorkoutLogger.js` (lines 12-21)
```javascript
const calculateExerciseVolume = (performedExercise) => {
  return (performedExercise.reps_per_set || []).reduce((total, reps, index) => {
    const weight = (performedExercise.weights_per_set || [])[index] || 0;
    return total + (reps || 0) * weight;
  }, 0);
};

const calculateTotalVolume = (exercises) => {
  return (exercises || []).reduce((total, ex) => total + calculateExerciseVolume(ex), 0);
};
```

### Backend - `analytics.py` (lines 9-15)
```python
def calculate_volume_per_set(performed_exercise):
    volume = 0
    for reps, weight in zip(performed_exercise.reps_per_set,
                          performed_exercise.weights_per_set or [0] * len(performed_exercise.reps_per_set)):
        volume += reps * (weight or 0)
    return volume
```

### Likely also in `WorkoutListPage.jsx`

## Problem

If the formula changes (e.g., adding bodyweight exercises, RPE weighting, or time-under-tension), you'd need to update multiple files and ensure they stay in sync.

## Recommended Solution

Make the backend the single source of truth for volume calculation.

### Step 1: Add Model Method

```python
# backend/workouts/models.py

class PerformedExercise(models.Model):
    # ... existing fields ...

    def calculate_volume(self):
        """Calculate total volume for this performed exercise."""
        if not self.reps_per_set:
            return 0
        weights = self.weights_per_set or [0] * len(self.reps_per_set)
        return sum(
            reps * (weight or 0)
            for reps, weight in zip(self.reps_per_set, weights)
        )


class Workout(models.Model):
    # ... existing fields ...

    def calculate_total_volume(self):
        """Calculate total volume across all performed exercises."""
        return sum(
            pe.calculate_volume()
            for pe in self.performed_exercises.all()
        )

    def update_volume(self):
        """Recalculate and save total_volume."""
        self.total_volume = self.calculate_total_volume()
        self.save(update_fields=['total_volume'])
```

### Step 2: Auto-Update on PerformedExercise Changes

```python
# backend/workouts/signals.py

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import PerformedExercise

@receiver([post_save, post_delete], sender=PerformedExercise)
def update_workout_volume(sender, instance, **kwargs):
    """Recalculate workout volume when exercises change."""
    if instance.workout_id:
        instance.workout.update_volume()
```

Register in `apps.py`:
```python
class WorkoutsConfig(AppConfig):
    # ...
    def ready(self):
        import workouts.signals
```

### Step 3: Remove Frontend Calculation

In `useWorkoutLogger.js`, remove `calculateExerciseVolume` and `calculateTotalVolume`.

For the workout creation flow, either:
- **Option A:** Don't send `total_volume` in the request; let the backend calculate it
- **Option B:** Keep frontend calculation for optimistic UI, but backend is authoritative

### Step 4: Update Analytics to Use Model Method

```python
# backend/workouts/analytics.py

def get_weekly_volume_data(user, start_date=None, end_date=None):
    # ... existing code ...

    for workout in workouts:
        # Use model method instead of inline calculation
        workout_volume = workout.calculate_total_volume()
        # ... rest of logic ...
```

Or better yet, just use the stored `total_volume` field:
```python
for workout in workouts:
    workout_volume = workout.total_volume  # Already computed
```

## Benefits

1. Single source of truth for volume formula
2. Easier to add new volume types (bodyweight, RPE-adjusted, etc.)
3. Less code to maintain on frontend
4. Volume always consistent between list and detail views
5. Analytics can use pre-computed values for speed

## Migration Steps

1. Add model methods to `models.py`
2. Create signals to auto-update volume
3. Run migration to recalculate all existing workouts:
   ```python
   # One-time management command
   for workout in Workout.objects.all():
       workout.update_volume()
   ```
4. Update `analytics.py` to use stored volume
5. Remove frontend volume calculation (or keep for optimistic UI only)
6. Update tests
