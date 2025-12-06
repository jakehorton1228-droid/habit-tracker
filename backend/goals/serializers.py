"""
goals/serializers.py
--------------------
REST API serializers for the goals app.

This module provides serializers that convert Goal and GoalProgress model
instances to and from JSON for API requests and responses.

Serializers:
    - GoalSerializer: Handles goal CRUD operations
    - GoalProgressSerializer: Handles progress update logging

Example API responses:
    # GET /api/goals/
    [
        {
            "id": 1,
            "name": "Save for vacation",
            "description": "Summer trip fund",
            "unit": "dollars",
            "target_value": "2000.00",
            "current_value": "500.00",
            "start_date": "2025-01-01",
            "end_date": "2025-06-30",
            "user": 1,
            "created_at": "2025-01-01T10:00:00Z",
            "updated_at": "2025-03-15T14:30:00Z"
        }
    ]

    # GET /api/goals/progress/
    [
        {
            "id": 1,
            "goal": 1,
            "date": "2025-03-15",
            "amount": "100.00",
            "note": "Monthly savings",
            "created_at": "2025-03-15T14:30:00Z"
        }
    ]
"""
from rest_framework import serializers
from .models import Goal, GoalProgress


class GoalSerializer(serializers.ModelSerializer):
    """
    Serializer for the Goal model.

    Handles serialization and deserialization of Goal instances for the API.
    The user field is read-only and automatically set from the request context
    in the view's perform_create method.

    Fields:
        id (int): Unique identifier (read-only).
        name (str): Display name for the goal.
        description (str): Detailed description of the goal.
        unit (str): Unit of measurement (dollars, pages, hours, etc.).
        target_value (Decimal): Target amount to achieve.
        current_value (Decimal): Current progress amount.
        start_date (date, optional): Goal start date (YYYY-MM-DD).
        end_date (date, optional): Goal deadline (YYYY-MM-DD).
        user (int): ID of the owning user (read-only, set automatically).
        created_at (datetime): Creation timestamp (read-only).
        updated_at (datetime): Last update timestamp (read-only).

    Example:
        # Creating a new goal (POST /api/goals/)
        >>> data = {
        ...     "name": "Read 24 books",
        ...     "unit": "books",
        ...     "target_value": "24.00",
        ...     "end_date": "2025-12-31"
        ... }
        >>> serializer = GoalSerializer(data=data)
        >>> serializer.is_valid()
        True
    """
    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ['user']


class GoalProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for the GoalProgress model.

    Handles serialization of goal progress updates. Each entry represents
    an incremental step toward achieving a goal.

    Fields:
        id (int): Unique identifier (read-only).
        goal (int): ID of the goal this progress applies to.
        date (date): Date of the progress entry (read-only, auto-set).
        amount (Decimal): Amount of progress made.
        note (str, optional): Notes about this progress update.
        created_at (datetime): Creation timestamp (read-only).

    Note:
        The view should update the parent Goal's current_value when
        creating progress entries.

    Example:
        # Logging progress (POST /api/goals/progress/)
        >>> data = {"goal": 1, "amount": "50.00", "note": "Weekly deposit"}
        >>> serializer = GoalProgressSerializer(data=data)
        >>> serializer.is_valid()
        True
    """
    class Meta:
        model = GoalProgress
        fields = '__all__'
