from rest_framework.routers import DefaultRouter
from .views import ExerciseViewSet, WorkoutViewSet, PerformedExerciseViewSet
from django.contrib.auth.models import User
from rest_framework import serializers, viewsets

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

urlpatterns = router.urls