"""
habits/views.py
---------------
REST API views for habit tracking functionality.

This module provides ViewSet classes that handle CRUD operations for habits
and habit completion logs. All endpoints require JWT authentication and
enforce user-level data isolation.

Endpoints:
    Habits (via HabitViewSet):
        GET    /api/habits/          - List user's habits
        POST   /api/habits/          - Create a new habit
        GET    /api/habits/{id}/     - Retrieve a specific habit
        PUT    /api/habits/{id}/     - Update a habit
        DELETE /api/habits/{id}/     - Delete a habit

    Habit Logs (via HabitLogViewSet):
        GET    /api/habits/logs/          - List user's habit logs
        POST   /api/habits/logs/          - Log a habit completion
        GET    /api/habits/logs/{id}/     - Retrieve a specific log
        PUT    /api/habits/logs/{id}/     - Update a log
        DELETE /api/habits/logs/{id}/     - Delete a log

Security:
    - All endpoints require valid JWT authentication
    - Users can only access their own habits and logs
    - Attempting to log habits owned by other users raises PermissionDenied
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters import rest_framework as filters

from .models import Habit, HabitLog
from .serializers import HabitSerializer, HabitLogSerializer


class HabitFilter(filters.FilterSet):
    """Filter for habits by category and frequency."""
    category = filters.ChoiceFilter(choices=Habit.CATEGORY_CHOICES)
    frequency = filters.CharFilter()
    created_after = filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Habit
        fields = ['category', 'frequency']


class HabitLogFilter(filters.FilterSet):
    """Filter for habit logs by date range and habit."""
    habit = filters.NumberFilter()
    date = filters.DateFilter()
    date_after = filters.DateFilter(field_name='date', lookup_expr='gte')
    date_before = filters.DateFilter(field_name='date', lookup_expr='lte')

    class Meta:
        model = HabitLog
        fields = ['habit', 'date']


class HabitViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user habits.

    Provides full CRUD functionality for habits. Each user can only view
    and modify their own habits. New habits are automatically associated
    with the authenticated user.

    Attributes:
        serializer_class: HabitSerializer for request/response handling.
        permission_classes: Requires JWT authentication.
        filterset_class: HabitFilter for filtering by category/frequency.
        search_fields: Fields to search (name).
        ordering_fields: Fields available for ordering.

    Methods:
        get_queryset: Filters habits to only return current user's habits.
        perform_create: Sets the user field when creating new habits.

    Example:
        # List habits
        GET /api/habits/
        Authorization: Bearer <token>

        # Filter by category
        GET /api/habits/?category=health
        Authorization: Bearer <token>

        # Search by name
        GET /api/habits/?search=exercise
        Authorization: Bearer <token>

        # Create habit
        POST /api/habits/
        Authorization: Bearer <token>
        {"name": "Exercise", "category": "health", "frequency": "daily"}

        # Update habit
        PUT /api/habits/1/
        Authorization: Bearer <token>
        {"name": "Morning Exercise", "category": "health", "frequency": "daily"}
    """
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = HabitFilter
    search_fields = ['name']
    ordering_fields = ['name', 'category', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Return only habits belonging to the authenticated user.

        Returns:
            QuerySet: Habits filtered by the current user.
        """
        return Habit.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Associate new habits with the authenticated user.

        Args:
            serializer: Validated HabitSerializer instance.
        """
        serializer.save(user=self.request.user)


class HabitLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing habit completion logs.

    Provides full CRUD functionality for habit logs. Users can only access
    logs for their own habits. When creating a log, ownership validation
    ensures users can only log completions for habits they own.

    Attributes:
        serializer_class: HabitLogSerializer for request/response handling.
        permission_classes: Requires JWT authentication.
        filterset_class: HabitLogFilter for filtering by date range/habit.
        ordering_fields: Fields available for ordering.

    Methods:
        get_queryset: Filters logs to habits owned by current user.
        perform_create: Validates habit ownership before saving.

    Raises:
        PermissionDenied: If user attempts to log a habit they don't own.

    Example:
        # List habit logs
        GET /api/habits/logs/
        Authorization: Bearer <token>

        # Filter by date range
        GET /api/habits/logs/?date_after=2025-12-01&date_before=2025-12-31
        Authorization: Bearer <token>

        # Filter by habit
        GET /api/habits/logs/?habit=1
        Authorization: Bearer <token>

        # Log a habit completion
        POST /api/habits/logs/
        Authorization: Bearer <token>
        {"habit": 1, "date": "2025-12-05", "note": "30 minute session"}

        # Delete a log entry
        DELETE /api/habits/logs/1/
        Authorization: Bearer <token>
    """
    serializer_class = HabitLogSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = HabitLogFilter
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']

    def get_queryset(self):
        """
        Return only logs for habits owned by the authenticated user.

        Returns:
            QuerySet: HabitLogs filtered by habits belonging to current user.
        """
        return HabitLog.objects.filter(habit__user=self.request.user)

    def perform_create(self, serializer):
        """
        Validate habit ownership and save the log entry.

        Ensures that users can only create log entries for habits they own.
        This prevents users from logging completions for other users' habits.

        Args:
            serializer: Validated HabitLogSerializer instance.

        Raises:
            PermissionDenied: If the habit belongs to a different user.
        """
        habit = serializer.validated_data.get('habit')
        if habit.user != self.request.user:
            raise PermissionDenied("You do not have permission to log this habit.")
        serializer.save()
