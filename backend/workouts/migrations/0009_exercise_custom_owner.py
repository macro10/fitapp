from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings

class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0008_backfill_workout_total_volume'),
    ]

    operations = [
        migrations.AddField(
            model_name='exercise',
            name='is_custom',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='exercise',
            name='owner',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='custom_exercises', to=settings.AUTH_USER_MODEL),
        ),
    ]