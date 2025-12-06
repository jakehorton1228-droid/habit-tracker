"""
journal/models.py
-----------------
Database models for the journaling feature with mood tracking.

This module provides the JournalEntry model which supports two types of entries:
- Freeform: Open-ended text entries for free writing
- Prompted: Guided entries with structured responses to predefined prompts

Each entry includes mood tracking to help users identify patterns in their
emotional well-being over time.

Example usage:
    # Create a freeform journal entry
    entry = JournalEntry.objects.create(
        user=user,
        date=date.today(),
        time=time(14, 30),
        entry_type='freeform',
        mood='good',
        content="Had a productive morning..."
    )

    # Create a prompted journal entry
    entry = JournalEntry.objects.create(
        user=user,
        date=date.today(),
        time=time(21, 0),
        entry_type='prompted',
        mood='great',
        responses={
            'gratitude': 'Grateful for sunny weather',
            'highlight': 'Finished my project',
            'learned': 'New Python technique'
        }
    )
"""
from django.db import models
from django.contrib.auth import get_user_model


class JournalEntry(models.Model):
    """
    Represents a single journal entry with mood tracking.

    Journal entries can be either freeform (open text) or prompted (structured
    responses to guided questions). Each entry captures the user's mood at the
    time of writing, enabling mood pattern analysis over time.

    Attributes:
        user (ForeignKey): The user who wrote this entry.
        date (date): The date of the journal entry.
        time (time): The time when the entry was written.
        entry_type (str): Type of entry - 'freeform' or 'prompted'.
        mood (str): User's mood when writing. One of:
            - 'great': Feeling excellent
            - 'good': Feeling positive
            - 'okay': Neutral mood
            - 'low': Feeling down
            - 'rough': Having a difficult time
        content (str): Free-text content for freeform entries.
        responses (dict): JSON object containing prompt responses for
            prompted entries. Keys are prompt IDs, values are user responses.
        created_at (datetime): When the entry was created.
        updated_at (datetime): When the entry was last modified.

    Example:
        >>> entry = JournalEntry.objects.create(
        ...     user=user,
        ...     date=date.today(),
        ...     time=time(20, 30),
        ...     mood='good',
        ...     content="Today was a great day for coding..."
        ... )
        >>> print(entry)
        john_doe - 2025-12-05 20:30:00
    """
    MOOD_CHOICES = [
        ('great', 'Great'),
        ('good', 'Good'),
        ('okay', 'Okay'),
        ('low', 'Low'),
        ('rough', 'Rough'),
    ]

    TYPE_CHOICES = [
        ('freeform', 'Freeform'),
        ('prompted', 'Prompted'),
    ]

    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='journal_entries',
        help_text="The user who wrote this entry"
    )
    date = models.DateField(
        help_text="Date of the journal entry"
    )
    time = models.TimeField(
        help_text="Time when the entry was written"
    )
    entry_type = models.CharField(
        max_length=10,
        choices=TYPE_CHOICES,
        default='freeform',
        help_text="Type of entry: freeform or prompted"
    )
    mood = models.CharField(
        max_length=10,
        choices=MOOD_CHOICES,
        default='okay',
        help_text="User's mood at time of writing"
    )
    content = models.TextField(
        blank=True,
        help_text="Free-text content for freeform entries"
    )
    responses = models.JSONField(
        blank=True,
        null=True,
        help_text="Structured responses for prompted entries (JSON object)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-time']
        verbose_name = 'journal entry'
        verbose_name_plural = 'journal entries'

    def __str__(self):
        return f"{self.user.username} - {self.date} {self.time}"
