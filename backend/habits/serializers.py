
"""
habits/serializers.py
---------------------
Serializers for Habit and HabitLog models, converting model instances to and from JSON for API use.
"""

from rest_framework import serializers
from .models import Habit, HabitLog

class HabitSerializer(serializers.ModelSerializer):
    """
    Serializer for the Habit model.
    """
    class Meta:
        model = Habit
        fields = '__all__'

class HabitLogSerializer(serializers.ModelSerializer):
    """
    Serializer for the HabitLog model.
    """
    class Meta:
        model = HabitLog
        fields = '__all__'
