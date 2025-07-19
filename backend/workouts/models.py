from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Exercise(models.Model):
    MUSCLE_GROUPS = [
        ('chest', 'Chest'),
        ('back', 'Back'),
        ('shoulders', 'Shoulders'),
        ('arms', 'Arms'),
        ('legs', 'Legs'),
        ('core', 'Core'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    muscle_group = models.CharField(
        max_length=20,
        choices=MUSCLE_GROUPS,
        default='core',
        null=False,
        blank=False
    )

    def __str__(self):
        return self.name

class Workout(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  date = models.DateField()
  name = models.CharField(max_length=100, default="Untitled Workout")

  def __str__(self):
    return f"{self.user.username}'s workout on {self.date}"

class PerformedExercise(models.Model):
  workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name='performed_exercises')
  exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
  sets = models.IntegerField()
  reps_per_set = models.JSONField()  # e.g., [10, 8, 8]
  weights_per_set = models.JSONField(blank=True, null=True)  # e.g., [100, 100, 90]

  def __str__(self):
    return f"{self.exercise.name} in {self.workout} ({self.sets} sets)"