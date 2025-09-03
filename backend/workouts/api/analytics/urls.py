from django.urls import path
from . import views

urlpatterns = [
    path('weekly-volume/', views.weekly_volume_analytics, name='weekly-volume-analytics'),
    path('top-workouts/', views.top_workouts_by_volume, name='top-workouts-by-volume'),
]
