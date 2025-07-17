from django.contrib import admin
from .models import Exercise, Workout, PerformedExercise

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'muscle_group', 'description')
    list_filter = ('muscle_group',)
    search_fields = ('name', 'description')

@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'notes')
    list_filter = ('user', 'date')
    search_fields = ('notes',)

@admin.register(PerformedExercise)
class PerformedExerciseAdmin(admin.ModelAdmin):
    list_display = ('workout', 'exercise', 'sets')
    list_filter = ('workout', 'exercise')
