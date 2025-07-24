from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.
class Exercise(models.Model):
    # Existing choices
    MUSCLE_GROUPS = [
        ('chest', 'Chest'),
        ('back', 'Back'),
        ('shoulders', 'Shoulders'),
        ('arms', 'Arms'),
        ('legs', 'Legs'),
        ('core', 'Core'),
    ]

    # New choices from free-exercise-db
    FORCE_TYPES = [
        ('static', 'Static'),
        ('pull', 'Pull'),
        ('push', 'Push'),
    ]

    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('expert', 'Expert'),
    ]

    MECHANIC_TYPES = [
        ('isolation', 'Isolation'),
        ('compound', 'Compound'),
    ]

    EQUIPMENT_TYPES = [
        ('medicine ball', 'Medicine Ball'),
        ('dumbbell', 'Dumbbell'),
        ('body only', 'Body Only'),
        ('bands', 'Bands'),
        ('kettlebells', 'Kettlebells'),
        ('foam roll', 'Foam Roll'),
        ('cable', 'Cable'),
        ('machine', 'Machine'),
        ('barbell', 'Barbell'),
        ('exercise ball', 'Exercise Ball'),
        ('e-z curl bar', 'EZ Curl Bar'),
        ('other', 'Other'),
    ]

    CATEGORY_CHOICES = [
        ('powerlifting', 'Powerlifting'),
        ('strength', 'Strength'),
        ('stretching', 'Stretching'),
        ('cardio', 'Cardio'),
        ('olympic weightlifting', 'Olympic Weightlifting'),
        ('strongman', 'Strongman'),
        ('plyometrics', 'Plyometrics'),
    ]

    # Keep the auto-incrementing ID
    # id = models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')

    # Required fields (maintaining existing ones)
    name = models.CharField(max_length=100)
    muscle_group = models.CharField(max_length=20, choices=MUSCLE_GROUPS, default='core')

    # New fields from free-exercise-db
    force = models.CharField(max_length=10, choices=FORCE_TYPES, null=True, blank=True)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    mechanic = models.CharField(max_length=20, choices=MECHANIC_TYPES, null=True, blank=True)
    equipment = models.CharField(max_length=20, choices=EQUIPMENT_TYPES, null=True, blank=True)
    primaryMuscles = models.JSONField(default=list)  # Using JSONField for arrays
    secondaryMuscles = models.JSONField(default=list)
    instructions = models.JSONField(default=list)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='strength')
    images = models.JSONField(default=list)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'exercise'  # Optional: explicitly set table name

class Workout(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  date = models.DateTimeField(default=timezone.now)
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