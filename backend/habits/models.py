"""
habits/models.py
----------------
Database models for tracking user habits and their completion logs.

This module defines two main models:
- Habit: Represents a recurring behavior the user wants to track
- HabitLog: Records individual completions of habits with optional notes

Example usage:
    # Create a new habit for a user
    habit = Habit.objects.create(
        user=user,
        name="Morning meditation",
        category="mindfulness",
        frequency="daily"
    )

    # Log a completion
    HabitLog.objects.create(
        habit=habit,
        date=date.today(),
        note="10 minutes of breathing exercises"
    )
"""
from django.db import models
from django.contrib.auth import get_user_model


class Habit(models.Model):
    """
    Represents a habit that a user wants to track regularly.

    Habits are categorized and can have different frequencies. Each habit
    belongs to a single user and can have multiple log entries recording
    when the habit was completed.

    Attributes:
        user (ForeignKey): The user who owns this habit.
        name (str): Display name for the habit (max 100 characters).
        category (str): Category for grouping habits. One of:
            - 'health': Physical health and fitness habits
            - 'productivity': Work and efficiency habits
            - 'learning': Educational and skill-building habits
            - 'mindfulness': Mental wellness and meditation habits
            - 'social': Relationship and social habits
        frequency (str): How often the habit should be performed.
            Defaults to 'daily'. Other options: 'weekly', 'monthly'.
        created_at (datetime): When the habit was created.
        updated_at (datetime): When the habit was last modified.

    Example:
        >>> habit = Habit.objects.create(
        ...     user=user,
        ...     name="Read 20 pages",
        ...     category="learning",
        ...     frequency="daily"
        ... )
        >>> print(habit)
        Read 20 pages (john_doe)
    """
    CATEGORY_CHOICES = [
        ('health', 'Health'),
        ('productivity', 'Productivity'),
        ('learning', 'Learning'),
        ('mindfulness', 'Mindfulness'),
        ('social', 'Social'),
    ]

    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        help_text="The user who owns this habit"
    )
    name = models.CharField(
        max_length=100,
        help_text="Display name for the habit"
    )
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='health',
        help_text="Category for grouping and filtering habits"
    )
    frequency = models.CharField(
        max_length=10,
        default='daily',
        help_text="How often the habit should be performed (daily, weekly, monthly)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'habit'
        verbose_name_plural = 'habits'

    def __str__(self):
        return f"{self.name} ({self.user.username})"


class HabitLog(models.Model):
    """
    Records a single completion of a habit on a specific date.

    Each log entry represents one instance of completing a habit.
    Users can optionally add notes to provide context about the completion.

    Attributes:
        habit (ForeignKey): The habit that was completed.
        date (date): The date when the habit was completed.
        note (str, optional): Additional notes about the completion.
        created_at (datetime): When this log entry was created.

    Example:
        >>> log = HabitLog.objects.create(
        ...     habit=meditation_habit,
        ...     date=date.today(),
        ...     note="Felt very calm afterward"
        ... )
        >>> print(log)
        Morning meditation on 2025-12-05
    """
    habit = models.ForeignKey(
        Habit,
        on_delete=models.CASCADE,
        related_name='logs',
        help_text="The habit that was completed"
    )
    date = models.DateField(
        help_text="Date when the habit was completed"
    )
    note = models.TextField(
        blank=True,
        null=True,
        help_text="Optional notes about this completion"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'habit log'
        verbose_name_plural = 'habit logs'
        unique_together = ['habit', 'date']

    def __str__(self):
        return f"{self.habit.name} on {self.date}"
