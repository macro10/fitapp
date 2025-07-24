from django.contrib import admin
from .models import Exercise, Workout, PerformedExercise

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    # Removing 'description' from list_display since we no longer have that field
    list_display = ('name', 'muscle_group')
    list_filter = ('muscle_group', 'level', 'category', 'equipment')  # Added new filters
    search_fields = ('name',)

@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'name')
    list_filter = ('user', 'date')
    search_fields = ('name',)

@admin.register(PerformedExercise)
class PerformedExerciseAdmin(admin.ModelAdmin):
    list_display = ('workout', 'exercise', 'sets')
    list_filter = ('workout', 'exercise')
