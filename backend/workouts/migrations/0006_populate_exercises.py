# backend/workouts/migrations/0006_populate_exercises.py

import requests
from django.db import migrations

def get_exercises():
    url = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    raise Exception("Failed to fetch exercises data")

def map_muscle_to_group(muscle):
    """Map detailed muscles to our simplified groups"""
    mapping = {
        'chest': 'chest',
        'lats': 'back',
        'middle back': 'back',
        'lower back': 'back',
        'traps': 'back',
        'shoulders': 'shoulders',
        'biceps': 'arms',
        'triceps': 'arms',
        'forearms': 'arms',
        'quadriceps': 'legs',
        'calves': 'legs',
        'glutes': 'legs',
        'hamstrings': 'legs',
        'abductors': 'legs',
        'adductors': 'legs',
        'abdominals': 'core',
        'neck': 'shoulders'
    }
    return mapping.get(muscle.lower(), 'core')

def populate_exercises(apps, schema_editor):
    Exercise = apps.get_model('workouts', 'Exercise')
    
    # Clear existing exercises
    Exercise.objects.all().delete()
    
    # Fetch exercises from GitHub
    exercises = get_exercises()
    
    for exercise_data in exercises:
        # Determine primary muscle group from the first primary muscle
        primary_muscle = exercise_data['primaryMuscles'][0] if exercise_data['primaryMuscles'] else 'abdominals'
        muscle_group = map_muscle_to_group(primary_muscle)
        
        # Handle image URLs
        images = [
            f"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{img}"
            for img in exercise_data.get('images', [])
        ]
        
        Exercise.objects.create(
            name=exercise_data['name'],
            muscle_group=muscle_group,
            force=exercise_data.get('force'),
            level=exercise_data.get('level', 'beginner'),
            mechanic=exercise_data.get('mechanic'),
            equipment=exercise_data.get('equipment'),
            primaryMuscles=exercise_data.get('primaryMuscles', []),
            secondaryMuscles=exercise_data.get('secondaryMuscles', []),
            instructions=exercise_data.get('instructions', []),
            category=exercise_data.get('category', 'strength'),
            images=images
        )

def reverse_migration(apps, schema_editor):
    Exercise = apps.get_model('workouts', 'Exercise')
    Exercise.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('workouts', '0005_remove_exercise_description_exercise_category_and_more'),  # Replace with your previous migration
    ]

    operations = [
        migrations.RunPython(populate_exercises, reverse_migration),
    ]