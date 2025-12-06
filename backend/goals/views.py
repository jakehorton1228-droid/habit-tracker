"""
goals/views.py
--------------
REST API views for goal tracking functionality.

This module provides ViewSet classes that handle CRUD operations for goals
and goal progress updates. All endpoints require JWT authentication and
enforce user-level data isolation.

Endpoints:
    Goals (via GoalViewSet):
        GET    /api/goals/          - List user's goals
        POST   /api/goals/          - Create a new goal
        GET    /api/goals/{id}/     - Retrieve a specific goal
        PUT    /api/goals/{id}/     - Update a goal
        DELETE /api/goals/{id}/     - Delete a goal

    Goal Progress (via GoalProgressViewSet):
        GET    /api/goals/progress/          - List progress entries
        POST   /api/goals/progress/          - Log progress toward a goal
        GET    /api/goals/progress/{id}/     - Retrieve a specific entry
        PUT    /api/goals/progress/{id}/     - Update an entry
        DELETE /api/goals/progress/{id}/     - Delete an entry

Security:
    - All endpoints require valid JWT authentication
    - Users can only access their own goals and progress entries
    - Attempting to log progress for other users' goals raises PermissionDenied
"""
from django.db import models
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters import rest_framework as filters

from .models import Goal, GoalProgress
from .serializers import GoalSerializer, GoalProgressSerializer


class GoalFilter(filters.FilterSet):
    """Filter for goals by completion status and date range."""
    is_complete = filters.BooleanFilter(method='filter_is_complete')
    end_date_after = filters.DateFilter(field_name='end_date', lookup_expr='gte')
    end_date_before = filters.DateFilter(field_name='end_date', lookup_expr='lte')
    has_deadline = filters.BooleanFilter(field_name='end_date', lookup_expr='isnull', exclude=True)

    class Meta:
        model = Goal
        fields = ['is_complete', 'has_deadline']

    def filter_is_complete(self, queryset, name, value):
        """Filter goals by completion status."""
        if value:
            return queryset.filter(current_value__gte=models.F('target_value'))
        return queryset.filter(current_value__lt=models.F('target_value'))


class GoalProgressFilter(filters.FilterSet):
    """Filter for goal progress by date range and goal."""
    goal = filters.NumberFilter()
    date = filters.DateFilter()
    date_after = filters.DateFilter(field_name='date', lookup_expr='gte')
    date_before = filters.DateFilter(field_name='date', lookup_expr='lte')

    class Meta:
        model = GoalProgress
        fields = ['goal', 'date']


class GoalViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user goals.

    Provides full CRUD functionality for goals. Each user can only view
    and modify their own goals. New goals are automatically associated
    with the authenticated user.

    Attributes:
        serializer_class: GoalSerializer for request/response handling.
        permission_classes: Requires JWT authentication.
        filterset_class: GoalFilter for filtering by completion/deadline.
        search_fields: Fields to search (name, description).
        ordering_fields: Fields available for ordering.

    Methods:
        get_queryset: Filters goals to only return current user's goals.
        perform_create: Sets the user field when creating new goals.

    Example:
        # List goals
        GET /api/goals/
        Authorization: Bearer <token>

        # Filter incomplete goals
        GET /api/goals/?is_complete=false
        Authorization: Bearer <token>

        # Filter goals with deadlines
        GET /api/goals/?has_deadline=true
        Authorization: Bearer <token>

        # Search by name
        GET /api/goals/?search=savings
        Authorization: Bearer <token>

        # Create goal
        POST /api/goals/
        Authorization: Bearer <token>
        {
            "name": "Save for vacation",
            "unit": "dollars",
            "target_value": "2000.00",
            "end_date": "2025-12-31"
        }

        # Update goal progress
        PUT /api/goals/1/
        Authorization: Bearer <token>
        {"current_value": "500.00"}
    """
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = GoalFilter
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'target_value', 'current_value', 'end_date', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Return only goals belonging to the authenticated user.

        Returns:
            QuerySet: Goals filtered by the current user.
        """
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Associate new goals with the authenticated user.

        Args:
            serializer: Validated GoalSerializer instance.
        """
        serializer.save(user=self.request.user)


class GoalProgressViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing goal progress updates.

    Provides full CRUD functionality for progress entries. Users can only
    access progress for their own goals. When creating an entry, ownership
    validation ensures users can only log progress for goals they own.

    Attributes:
        serializer_class: GoalProgressSerializer for request/response handling.
        permission_classes: Requires JWT authentication.
        filterset_class: GoalProgressFilter for filtering by date range/goal.
        ordering_fields: Fields available for ordering.

    Methods:
        get_queryset: Filters entries to goals owned by current user.
        perform_create: Validates goal ownership before saving.

    Raises:
        PermissionDenied: If user attempts to log progress for a goal they don't own.

    Example:
        # List progress entries
        GET /api/goals/progress/
        Authorization: Bearer <token>

        # Filter by goal
        GET /api/goals/progress/?goal=1
        Authorization: Bearer <token>

        # Filter by date range
        GET /api/goals/progress/?date_after=2025-12-01
        Authorization: Bearer <token>

        # Log progress toward a goal
        POST /api/goals/progress/
        Authorization: Bearer <token>
        {"goal": 1, "amount": "100.00", "note": "Weekly savings"}

        # Delete a progress entry
        DELETE /api/goals/progress/1/
        Authorization: Bearer <token>
    """
    serializer_class = GoalProgressSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = GoalProgressFilter
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date']

    def get_queryset(self):
        """
        Return only progress entries for goals owned by the authenticated user.

        Returns:
            QuerySet: GoalProgress entries filtered by goals belonging to current user.
        """
        return GoalProgress.objects.filter(goal__user=self.request.user)

    def perform_create(self, serializer):
        """
        Validate goal ownership and save the progress entry.

        Ensures that users can only create progress entries for goals they own.
        This prevents users from logging progress for other users' goals.

        Args:
            serializer: Validated GoalProgressSerializer instance.

        Raises:
            PermissionDenied: If the goal belongs to a different user.
        """
        goal = serializer.validated_data.get('goal')
        if goal.user != self.request.user:
            raise PermissionDenied("You do not have permission to log progress for this goal.")
        serializer.save()
