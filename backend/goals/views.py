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
from datetime import date, timedelta
from django.db import models
from django.db.models import Sum, Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
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

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get goal statistics and summary for the authenticated user.

        Returns comprehensive statistics including:
        - Total goals count
        - Completed goals count
        - In-progress goals count
        - Goals with deadlines approaching (next 7 days)
        - Overall completion rate
        - Recent progress entries
        - Per-goal progress summary

        Example:
            GET /api/goals/stats/
            Authorization: Bearer <token>
        """
        user = request.user
        today = date.today()
        goals = Goal.objects.filter(user=user)
        progress = GoalProgress.objects.filter(goal__user=user)

        # Total goals
        total_goals = goals.count()

        # Completed vs in-progress
        completed_goals = goals.filter(current_value__gte=models.F('target_value')).count()
        in_progress_goals = total_goals - completed_goals

        # Goals with deadlines approaching (next 7 days)
        next_week = today + timedelta(days=7)
        approaching_deadlines = list(goals.filter(
            end_date__gte=today,
            end_date__lte=next_week,
            current_value__lt=models.F('target_value')
        ).values('id', 'name', 'end_date', 'current_value', 'target_value', 'unit'))

        # Overall completion rate (sum of progress percentages / total goals)
        goal_stats = []
        total_percentage = 0
        for goal in goals:
            if goal.target_value > 0:
                percentage = min(100, round((float(goal.current_value) / float(goal.target_value)) * 100))
            else:
                percentage = 100 if goal.current_value >= goal.target_value else 0
            total_percentage += percentage
            goal_stats.append({
                'id': goal.id,
                'name': goal.name,
                'unit': goal.unit,
                'current_value': str(goal.current_value),
                'target_value': str(goal.target_value),
                'percentage': percentage,
                'end_date': goal.end_date.isoformat() if goal.end_date else None,
                'is_complete': goal.current_value >= goal.target_value,
            })

        overall_completion_rate = round(total_percentage / total_goals) if total_goals > 0 else 0

        # Recent progress entries (last 10)
        recent_progress = list(progress.order_by('-date', '-created_at')[:10].values(
            'id', 'goal__name', 'amount', 'date', 'note'
        ))
        for entry in recent_progress:
            entry['goal_name'] = entry.pop('goal__name')
            entry['amount'] = str(entry['amount'])
            entry['date'] = entry['date'].isoformat()

        # Progress this week
        week_start = today - timedelta(days=today.weekday())
        progress_this_week = progress.filter(date__gte=week_start).aggregate(
            total=Sum('amount'),
            count=Count('id')
        )

        return Response({
            'total_goals': total_goals,
            'completed_goals': completed_goals,
            'in_progress_goals': in_progress_goals,
            'overall_completion_rate': overall_completion_rate,
            'approaching_deadlines': approaching_deadlines,
            'goal_stats': goal_stats,
            'recent_progress': recent_progress,
            'progress_this_week': {
                'total': str(progress_this_week['total'] or 0),
                'count': progress_this_week['count'],
            },
        })


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
        Validate goal ownership, save the progress entry, and update goal's current_value.

        Ensures that users can only create progress entries for goals they own.
        Automatically adds the progress amount to the goal's current_value.

        Args:
            serializer: Validated GoalProgressSerializer instance.

        Raises:
            PermissionDenied: If the goal belongs to a different user.
        """
        goal = serializer.validated_data.get('goal')
        if goal.user != self.request.user:
            raise PermissionDenied("You do not have permission to log progress for this goal.")
        progress = serializer.save()
        # Auto-sync: Add progress amount to goal's current_value
        goal.current_value += progress.amount
        goal.save()

    def perform_update(self, serializer):
        """
        Update a progress entry and adjust the goal's current_value accordingly.

        When updating progress, the difference between old and new amounts
        is applied to the goal's current_value.

        Args:
            serializer: Validated GoalProgressSerializer instance.
        """
        old_amount = serializer.instance.amount
        progress = serializer.save()
        # Auto-sync: Adjust goal's current_value by the difference
        amount_diff = progress.amount - old_amount
        goal = progress.goal
        goal.current_value += amount_diff
        goal.save()

    def perform_destroy(self, instance):
        """
        Delete a progress entry and subtract its amount from the goal's current_value.

        Args:
            instance: GoalProgress instance to delete.
        """
        goal = instance.goal
        # Auto-sync: Subtract the deleted amount from goal's current_value
        goal.current_value -= instance.amount
        goal.save()
        instance.delete()
