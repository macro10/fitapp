performed-exercises:
{
  "workout": 1,
  "exercise": 1,
  "sets": 3,
  "reps_per_set": [10, 8, 8],
  "weights_per_set": [100, 100, 90]
}

exercises:
{
  "name": "",
  "description": ""
}

workouts:
{
    "date": "2025-05-12",
    "notes": "push day",
    "user": 1
}

1, 6, 5, 7, 9, 8

To show all workouts from the backend:

1. Open Django shell
```bash
python3 manage.py shell
```

2. Paste the script and press enter 2x
```python
from workouts.models import Workout

for workout in Workout.objects.all():
    print(f"Workout by: {workout.user.username} on {workout.date}")
    print(f"  Notes: {workout.notes}")
    for pe in workout.performed_exercises.all():
        print(f"    Exercise: {pe.exercise.name}")
        print(f"      Sets: {pe.sets}")
        print(f"      Reps per set: {pe.reps_per_set}")
        print(f"      Weights per set: {pe.weights_per_set}")
    print("-" * 40)
```