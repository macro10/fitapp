from rest_framework import serializers
from .models import Exercise, Workout, PerformedExercise

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'

class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = '__all__'

class PerformedExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformedExercise
        fields = '__all__'
