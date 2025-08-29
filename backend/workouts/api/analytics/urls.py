from django.urls import path
from . import views

urlpatterns = [
    path('weekly-volume/', views.weekly_volume_analytics, name='weekly-volume-analytics'),
    # Future analytics URL patterns will go here
]
