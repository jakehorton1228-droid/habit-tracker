
"""
goals/serializers.py
--------------------
Serializers for Goal and GoalProgress models, converting model instances to and from JSON for API use.
"""

from rest_framework import serializers
from .models import Goal, GoalProgress


class GoalSerializer(serializers.ModelSerializer):
    """
    Serializer for the Goal model.
    """
    class Meta:
        model = Goal
        fields = '__all__'

class GoalProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for the GoalProgress model.
    """
    class Meta:
        model = GoalProgress
        fields = '__all__'

# Add GoalProgressSerializer if you create a GoalProgress model.
