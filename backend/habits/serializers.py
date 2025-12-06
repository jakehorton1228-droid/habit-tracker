"""
habits/serializers.py
---------------------
REST API serializers for the habits app.

This module provides serializers that convert Habit and HabitLog model
instances to and from JSON for API requests and responses.

Serializers:
    - HabitSerializer: Handles habit CRUD operations
    - HabitLogSerializer: Handles habit completion logging

Example API responses:
    # GET /api/habits/
    [
        {
            "id": 1,
            "name": "Morning meditation",
            "category": "mindfulness",
            "frequency": "daily",
            "user": 1,
            "created_at": "2025-12-05T10:00:00Z",
            "updated_at": "2025-12-05T10:00:00Z"
        }
    ]

    # GET /api/habits/logs/
    [
        {
            "id": 1,
            "habit": 1,
            "date": "2025-12-05",
            "note": "10 minutes session",
            "created_at": "2025-12-05T08:30:00Z"
        }
    ]
"""
from rest_framework import serializers
from .models import Habit, HabitLog


class HabitSerializer(serializers.ModelSerializer):
    """
    Serializer for the Habit model.

    Handles serialization and deserialization of Habit instances for the API.
    The user field is read-only and automatically set from the request context
    in the view's perform_create method.

    Fields:
        id (int): Unique identifier (read-only).
        name (str): Display name for the habit.
        category (str): Category slug (health, productivity, learning, etc.).
        frequency (str): How often the habit should be performed.
        user (int): ID of the owning user (read-only, set automatically).
        created_at (datetime): Creation timestamp (read-only).
        updated_at (datetime): Last update timestamp (read-only).

    Example:
        # Creating a new habit (POST /api/habits/)
        >>> data = {"name": "Read 20 pages", "category": "learning", "frequency": "daily"}
        >>> serializer = HabitSerializer(data=data)
        >>> serializer.is_valid()
        True
    """
    class Meta:
        model = Habit
        fields = '__all__'
        read_only_fields = ['user']


class HabitLogSerializer(serializers.ModelSerializer):
    """
    Serializer for the HabitLog model.

    Handles serialization of habit completion logs. Each log represents
    a single instance of completing a habit on a specific date.

    Fields:
        id (int): Unique identifier (read-only).
        habit (int): ID of the completed habit.
        date (date): Date of completion (YYYY-MM-DD format).
        note (str, optional): Notes about the completion.
        created_at (datetime): Creation timestamp (read-only).

    Example:
        # Logging a habit completion (POST /api/habits/logs/)
        >>> data = {"habit": 1, "date": "2025-12-05", "note": "Great session!"}
        >>> serializer = HabitLogSerializer(data=data)
        >>> serializer.is_valid()
        True
    """
    class Meta:
        model = HabitLog
        fields = '__all__'
