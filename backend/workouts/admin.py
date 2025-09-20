from django.contrib import admin
from .models import Exercise, Workout, PerformedExercise

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'muscle_group', 'is_custom', 'owner')
    list_filter = ('muscle_group', 'level', 'category', 'equipment', 'is_custom')
    search_fields = ('name',)

@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'name', 'total_volume')
    list_filter = ('user', 'date')
    search_fields = ('name',)

@admin.register(PerformedExercise)
class PerformedExerciseAdmin(admin.ModelAdmin):
    list_display = ('workout', 'exercise', 'sets')
    list_filter = ('workout', 'exercise')