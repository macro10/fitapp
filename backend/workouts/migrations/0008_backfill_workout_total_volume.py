from django.db import migrations

def calc_total_volume_for_workout(workout, PerformedExercise):
    total = 0
    for pe in PerformedExercise.objects.filter(workout_id=workout.id).only('reps_per_set', 'weights_per_set'):
        reps = pe.reps_per_set or []
        weights = pe.weights_per_set or []
        pe_total = 0
        for i, r in enumerate(reps):
            w = weights[i] if i < len(weights) else 0
            try:
                r_val = int(r)
            except Exception:
                r_val = 0
            try:
                w_val = int(w)
            except Exception:
                w_val = 0
            pe_total += r_val * w_val
        total += pe_total
    return total

def forwards(apps, schema_editor):
    Workout = apps.get_model('workouts', 'Workout')
    PerformedExercise = apps.get_model('workouts', 'PerformedExercise')
    for workout in Workout.objects.all().iterator():
        total = calc_total_volume_for_workout(workout, PerformedExercise)
        if workout.total_volume != total:
            Workout.objects.filter(pk=workout.pk).update(total_volume=total)

class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0007_workout_total_volume'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]