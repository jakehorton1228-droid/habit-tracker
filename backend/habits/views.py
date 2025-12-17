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
from datetime import date, timedelta
from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
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

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get habit statistics for the authenticated user.

        Returns comprehensive statistics including:
        - Total habits count
        - Completions today
        - Current streak (consecutive days with any completion)
        - Best streak
        - Weekly completion rates (last 8 weeks)
        - Per-habit statistics (90-day completion rate)
        - Heatmap data (last 90 days)

        Example:
            GET /api/habits/stats/
            Authorization: Bearer <token>
        """
        user = request.user
        today = date.today()
        habits = Habit.objects.filter(user=user)
        logs = HabitLog.objects.filter(habit__user=user)

        # Total habits
        total_habits = habits.count()

        # Completions today
        completions_today = logs.filter(date=today).count()

        # Calculate current streak (consecutive days with any log)
        log_dates = set(logs.values_list('date', flat=True))
        current_streak = 0
        check_date = today
        while check_date in log_dates:
            current_streak += 1
            check_date -= timedelta(days=1)

        # Calculate best streak (longest consecutive run)
        sorted_dates = sorted(log_dates)
        best_streak = 0
        if sorted_dates:
            streak = 1
            for i in range(1, len(sorted_dates)):
                if sorted_dates[i] - sorted_dates[i-1] == timedelta(days=1):
                    streak += 1
                else:
                    best_streak = max(best_streak, streak)
                    streak = 1
            best_streak = max(best_streak, streak)

        # Weekly completion rates (last 8 weeks)
        weekly_stats = []
        for week_offset in range(7, -1, -1):
            week_start = today - timedelta(days=today.weekday() + (week_offset * 7))
            week_end = week_start + timedelta(days=6)
            if week_end > today:
                week_end = today

            days_in_week = (week_end - week_start).days + 1
            total_possible = total_habits * days_in_week
            week_completions = logs.filter(
                date__gte=week_start,
                date__lte=week_end
            ).count()

            rate = round((week_completions / total_possible) * 100) if total_possible > 0 else 0
            weekly_stats.append({
                'week_start': week_start.isoformat(),
                'completions': week_completions,
                'possible': total_possible,
                'rate': rate,
            })

        # Per-habit stats (90 days)
        ninety_days_ago = today - timedelta(days=90)
        habit_stats = []
        for habit in habits:
            habit_logs = logs.filter(habit=habit, date__gte=ninety_days_ago)
            completion_count = habit_logs.count()
            rate = round((completion_count / 90) * 100)
            habit_stats.append({
                'id': habit.id,
                'name': habit.name,
                'category': habit.category,
                'completions': completion_count,
                'rate': rate,
            })
        habit_stats.sort(key=lambda x: x['rate'], reverse=True)

        # Heatmap data (last 90 days - dates with completions)
        heatmap_data = list(logs.filter(
            date__gte=ninety_days_ago
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date'))
        heatmap_dates = [{'date': item['date'].isoformat(), 'count': item['count']} for item in heatmap_data]

        return Response({
            'total_habits': total_habits,
            'completions_today': completions_today,
            'current_streak': current_streak,
            'best_streak': best_streak,
            'weekly_stats': weekly_stats,
            'habit_stats': habit_stats,
            'heatmap': heatmap_dates,
        })


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
