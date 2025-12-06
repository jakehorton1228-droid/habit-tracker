"""
journal/serializers.py
----------------------
REST API serializers for the journal app.

This module provides serializers that convert JournalEntry model instances
to and from JSON for API requests and responses.

Example API responses:
    # GET /api/journal/
    [
        {
            "id": 1,
            "date": "2025-12-05",
            "time": "20:30:00",
            "entry_type": "freeform",
            "mood": "good",
            "content": "Had a productive day...",
            "responses": null,
            "created_at": "2025-12-05T20:30:00Z",
            "updated_at": "2025-12-05T20:30:00Z"
        },
        {
            "id": 2,
            "date": "2025-12-05",
            "time": "21:00:00",
            "entry_type": "prompted",
            "mood": "great",
            "content": "",
            "responses": {
                "gratitude": "Grateful for good weather",
                "highlight": "Finished my project",
                "learned": "New coding technique"
            },
            "created_at": "2025-12-05T21:00:00Z",
            "updated_at": "2025-12-05T21:00:00Z"
        }
    ]
"""
from rest_framework import serializers
from .models import JournalEntry


class JournalEntrySerializer(serializers.ModelSerializer):
    """
    Serializer for the JournalEntry model.

    Handles serialization and deserialization of journal entries for the API.
    Supports both freeform text entries and prompted (guided) entries with
    structured responses.

    Fields:
        id (int): Unique identifier (read-only).
        date (date): Date of the entry (YYYY-MM-DD format).
        time (time): Time of the entry (HH:MM:SS format).
        entry_type (str): Type of entry - 'freeform' or 'prompted'.
        mood (str): User's mood - 'great', 'good', 'okay', 'low', or 'rough'.
        content (str): Free-text content for freeform entries.
        responses (dict): JSON object with prompt responses for prompted entries.
        created_at (datetime): Creation timestamp (read-only).
        updated_at (datetime): Last update timestamp (read-only).

    Note:
        The user field is excluded from the serializer and set automatically
        in the view's perform_create method.

    Example:
        # Creating a freeform entry (POST /api/journal/)
        >>> data = {
        ...     "date": "2025-12-05",
        ...     "time": "20:30:00",
        ...     "entry_type": "freeform",
        ...     "mood": "good",
        ...     "content": "Today was a great day..."
        ... }
        >>> serializer = JournalEntrySerializer(data=data)
        >>> serializer.is_valid()
        True

        # Creating a prompted entry (POST /api/journal/)
        >>> data = {
        ...     "date": "2025-12-05",
        ...     "time": "21:00:00",
        ...     "entry_type": "prompted",
        ...     "mood": "great",
        ...     "responses": {"gratitude": "Family time", "highlight": "Promotion"}
        ... }
        >>> serializer = JournalEntrySerializer(data=data)
        >>> serializer.is_valid()
        True
    """
    class Meta:
        model = JournalEntry
        fields = ['id', 'date', 'time', 'entry_type', 'mood', 'content', 'responses', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
