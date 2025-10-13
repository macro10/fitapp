from rest_framework.routers import DefaultRouter
from .views import ExerciseViewSet, WorkoutViewSet, PerformedExerciseViewSet, UserRegistrationView, weekly_frequency
from django.contrib.auth.models import User
from rest_framework import serializers, viewsets
from django.urls import path, include
from django.utils.dateparse import parse_datetime
from .analytics import get_weekly_workout_frequency

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

router = DefaultRouter()
router.register(r'exercises', ExerciseViewSet)
router.register(r'workouts', WorkoutViewSet)
router.register(r'performed-exercises', PerformedExerciseViewSet)
router.register(r'users', UserViewSet)

urlpatterns = router.urls + [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('analytics/', include('workouts.api.analytics.urls')),
    path('analytics/weekly-frequency/', weekly_frequency, name='weekly-frequency'),
]