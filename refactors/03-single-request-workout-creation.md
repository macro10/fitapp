# Refactor: Single-Request Workout Creation

**Priority:** High Impact | Medium Effort
**Do first if:** Users on slow networks, or experiencing partial save failures

## Current State

Creating a workout requires N+1 API calls:

```javascript
// api.js lines 56-77
export const createWorkoutWithExercises = async (date, performedExercises, name, total_volume) => {
  // First create the workout (1 API call)
  const workout = await createWorkout(date, name, total_volume)

  // Then create all performed exercises (N API calls)
  const createdExercises = await Promise.all(
    performedExercises.map(exercise =>
      createPerformedExercise(workout.id, exercise)
    )
  )

  return { ...workout, performed_exercises: createdExercises }
}
```

## Problems

1. **Race conditions:** Parallel `createPerformedExercise` calls could fail independently
2. **No transactionality:** If one exercise fails to save, you get a partial workout
3. **Slow on mobile:** Each call has network overhead (especially on high-latency connections)
4. **No rollback:** If exercise 3 of 5 fails, exercises 1-2 are orphaned

## Recommended Solution

Create a nested writable serializer that handles the entire workout in one atomic transaction.

### Step 1: Update Serializer

```python
# backend/workouts/serializers.py

class PerformedExerciseCreateSerializer(serializers.Serializer):
    """Serializer for creating performed exercises within a workout."""
    exercise_id = serializers.IntegerField()
    sets = serializers.IntegerField()
    reps_per_set = serializers.ListField(child=serializers.IntegerField())
    weights_per_set = serializers.ListField(
        child=serializers.FloatField(),
        required=False,
        allow_null=True
    )


class WorkoutCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a workout with nested performed exercises."""
    performed_exercises = PerformedExerciseCreateSerializer(many=True, write_only=True)

    class Meta:
        model = Workout
        fields = ['date', 'name', 'performed_exercises']

    def create(self, validated_data):
        performed_exercises_data = validated_data.pop('performed_exercises')
        user = self.context['request'].user

        # Create workout
        workout = Workout.objects.create(user=user, **validated_data)

        # Create all performed exercises
        for pe_data in performed_exercises_data:
            exercise = Exercise.objects.get(id=pe_data['exercise_id'])
            PerformedExercise.objects.create(
                workout=workout,
                exercise=exercise,
                sets=pe_data['sets'],
                reps_per_set=pe_data['reps_per_set'],
                weights_per_set=pe_data.get('weights_per_set')
            )

        # Recalculate volume (if using signal, this happens automatically)
        workout.update_volume()

        return workout

    def to_representation(self, instance):
        """Return full workout details after creation."""
        return WorkoutSerializer(instance).data
```

### Step 2: Update ViewSet

```python
# backend/workouts/views.py

class WorkoutViewSet(viewsets.ModelViewSet):
    # ... existing code ...

    def get_serializer_class(self):
        if self.action == 'create':
            return WorkoutCreateSerializer
        if self.action == 'list':
            summary_flag = self.request.query_params.get('summary')
            if summary_flag in ('1', 'true', 'True'):
                return WorkoutSummarySerializer
        return WorkoutSerializer
```

### Step 3: Wrap in Transaction

```python
# backend/workouts/serializers.py

from django.db import transaction

class WorkoutCreateSerializer(serializers.ModelSerializer):
    # ... fields ...

    @transaction.atomic
    def create(self, validated_data):
        # ... same code ...
        # Now if any part fails, entire transaction rolls back
```

### Step 4: Update Frontend API

```javascript
// api.js

export const createWorkoutWithExercises = async (date, performedExercises, name) => {
  const response = await api.post(`${API_BASE}/api/workouts/`, {
    date,
    name,
    performed_exercises: performedExercises.map(ex => ({
      exercise_id: ex.exercise,
      sets: ex.sets,
      reps_per_set: ex.reps_per_set,
      weights_per_set: ex.weights_per_set
    }))
  });
  return response.data;
};
```

### Step 5: Update useWorkoutLogger

```javascript
// hooks/useWorkoutLogger.js

const handleFinishWorkout = async () => {
  try {
    setSaving(true);
    // No need to calculate volume - backend does it
    const created = await createWorkoutWithExercises(
      new Date().toISOString(),
      workoutState.exercises,
      workoutState.name
    );
    upsertWorkout(created);
    // ... cleanup ...
  } catch (err) {
    setError("Failed to save workout. Please try again.");
  } finally {
    setSaving(false);
  }
};
```

## API Request Format

**Before (N+1 calls):**
```
POST /api/workouts/  →  { date, name, total_volume }
POST /api/performed-exercises/  →  { workout, exercise_id, sets, reps_per_set, weights_per_set }
POST /api/performed-exercises/  →  { ... }
POST /api/performed-exercises/  →  { ... }
```

**After (1 call):**
```
POST /api/workouts/
{
  "date": "2026-02-03T19:00:00Z",
  "name": "Chest and Back Workout",
  "performed_exercises": [
    {
      "exercise_id": 42,
      "sets": 3,
      "reps_per_set": [10, 8, 8],
      "weights_per_set": [135, 135, 135]
    },
    {
      "exercise_id": 15,
      "sets": 3,
      "reps_per_set": [10, 10, 10],
      "weights_per_set": [55, 55, 55]
    }
  ]
}
```

## Benefits

1. **Atomic:** All or nothing - no partial workouts
2. **Faster:** Single round-trip instead of N+1
3. **Simpler frontend:** One API call, one error handler
4. **Better UX:** Faster save, cleaner error states
5. **Easier to extend:** Add workout templates, copy workouts, etc.

## Migration Steps

1. Add `WorkoutCreateSerializer` and `PerformedExerciseCreateSerializer`
2. Update `WorkoutViewSet.get_serializer_class()`
3. Test via API docs (`/api/docs/`)
4. Update `api.js` on frontend
5. Update `useWorkoutLogger.js`
6. Remove `createPerformedExercise` from `api.js` (or keep for edit functionality)
7. Update any tests
