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
from rest_framework import viewsets
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
