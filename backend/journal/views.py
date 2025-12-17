"""
journal/views.py
----------------
REST API views for the journaling feature.

This module provides a ViewSet class that handles CRUD operations for journal
entries. All endpoints require JWT authentication and enforce user-level
data isolation.

Endpoints:
    Journal Entries (via JournalEntryViewSet):
        GET    /api/journal/          - List user's journal entries
        POST   /api/journal/          - Create a new entry
        GET    /api/journal/{id}/     - Retrieve a specific entry
        PUT    /api/journal/{id}/     - Update an entry
        DELETE /api/journal/{id}/     - Delete an entry

Security:
    - All endpoints require valid JWT authentication
    - Users can only access their own journal entries
    - Entries are automatically associated with the authenticated user

Features:
    - Supports both freeform and prompted entry types
    - Mood tracking on each entry
    - Ordered by date and time (newest first)
"""
from datetime import date, timedelta
from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters import rest_framework as filters

from .models import JournalEntry
from .serializers import JournalEntrySerializer


class JournalEntryFilter(filters.FilterSet):
    """Filter for journal entries by date, mood, and entry type."""
    date = filters.DateFilter()
    date_after = filters.DateFilter(field_name='date', lookup_expr='gte')
    date_before = filters.DateFilter(field_name='date', lookup_expr='lte')
    mood = filters.ChoiceFilter(choices=JournalEntry.MOOD_CHOICES)
    entry_type = filters.ChoiceFilter(choices=JournalEntry.TYPE_CHOICES)

    class Meta:
        model = JournalEntry
        fields = ['date', 'mood', 'entry_type']


class JournalEntryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing journal entries.

    Provides full CRUD functionality for journal entries. Each user can only
    view and modify their own entries. Supports both freeform text entries
    and prompted entries with structured responses.

    Attributes:
        serializer_class: JournalEntrySerializer for request/response handling.
        permission_classes: Requires JWT authentication.
        filterset_class: JournalEntryFilter for filtering by date/mood/type.
        search_fields: Fields to search (content).
        ordering_fields: Fields available for ordering.

    Methods:
        get_queryset: Filters entries to only return current user's entries.
        perform_create: Sets the user field when creating new entries.

    Example:
        # List journal entries
        GET /api/journal/
        Authorization: Bearer <token>

        # Filter by mood
        GET /api/journal/?mood=good
        Authorization: Bearer <token>

        # Filter by date range
        GET /api/journal/?date_after=2025-12-01&date_before=2025-12-31
        Authorization: Bearer <token>

        # Filter by entry type
        GET /api/journal/?entry_type=freeform
        Authorization: Bearer <token>

        # Search in content
        GET /api/journal/?search=productive
        Authorization: Bearer <token>

        # Create freeform entry
        POST /api/journal/
        Authorization: Bearer <token>
        {
            "date": "2025-12-05",
            "time": "20:30:00",
            "entry_type": "freeform",
            "mood": "good",
            "content": "Had a productive day today..."
        }

        # Create prompted entry
        POST /api/journal/
        Authorization: Bearer <token>
        {
            "date": "2025-12-05",
            "time": "21:00:00",
            "entry_type": "prompted",
            "mood": "great",
            "responses": {
                "gratitude": "Grateful for sunny weather",
                "highlight": "Finished my project"
            }
        }

        # Delete an entry
        DELETE /api/journal/1/
        Authorization: Bearer <token>
    """
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]
    filterset_class = JournalEntryFilter
    search_fields = ['content']
    ordering_fields = ['date', 'time', 'mood', 'created_at']
    ordering = ['-date', '-time']

    def get_queryset(self):
        """
        Return only journal entries belonging to the authenticated user.

        Entries are returned in reverse chronological order (newest first)
        as defined by the model's Meta ordering.

        Returns:
            QuerySet: JournalEntry objects filtered by the current user.
        """
        return JournalEntry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Associate new journal entries with the authenticated user.

        Args:
            serializer: Validated JournalEntrySerializer instance.
        """
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get journal statistics and mood trends for the authenticated user.

        Returns comprehensive statistics including:
        - Total entries count
        - Entries this week
        - Mood distribution (all time)
        - Mood trends (last 30 days, grouped by week)
        - Entry type breakdown
        - Writing streak (consecutive days with entries)

        Example:
            GET /api/journal/stats/
            Authorization: Bearer <token>
        """
        user = request.user
        today = date.today()
        entries = JournalEntry.objects.filter(user=user)

        # Total entries
        total_entries = entries.count()

        # Entries this week
        week_start = today - timedelta(days=today.weekday())
        entries_this_week = entries.filter(date__gte=week_start).count()

        # Mood distribution (all time)
        mood_distribution = list(entries.values('mood').annotate(
            count=Count('id')
        ).order_by('mood'))

        # Mood trends (last 30 days, grouped by week)
        thirty_days_ago = today - timedelta(days=30)
        mood_trends = []
        for week_offset in range(4, -1, -1):
            week_start = today - timedelta(days=(week_offset * 7) + today.weekday())
            week_end = week_start + timedelta(days=6)
            if week_end > today:
                week_end = today
            if week_start < thirty_days_ago:
                week_start = thirty_days_ago

            week_entries = entries.filter(date__gte=week_start, date__lte=week_end)
            week_mood_counts = dict(week_entries.values('mood').annotate(
                count=Count('id')
            ).values_list('mood', 'count'))

            mood_trends.append({
                'week_start': week_start.isoformat(),
                'week_end': week_end.isoformat(),
                'moods': week_mood_counts,
                'total': sum(week_mood_counts.values()),
            })

        # Entry type breakdown
        entry_types = list(entries.values('entry_type').annotate(
            count=Count('id')
        ).order_by('entry_type'))

        # Writing streak (consecutive days with entries)
        entry_dates = set(entries.values_list('date', flat=True))
        current_streak = 0
        check_date = today
        while check_date in entry_dates:
            current_streak += 1
            check_date -= timedelta(days=1)

        # Best streak
        sorted_dates = sorted(entry_dates)
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

        return Response({
            'total_entries': total_entries,
            'entries_this_week': entries_this_week,
            'mood_distribution': mood_distribution,
            'mood_trends': mood_trends,
            'entry_types': entry_types,
            'current_streak': current_streak,
            'best_streak': best_streak,
        })
