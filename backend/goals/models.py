"""
goals/models.py
---------------
Database models for tracking user goals and progress updates.

This module defines two main models:
- Goal: Represents a measurable objective with a target value
- GoalProgress: Records incremental progress updates toward goals

Goals support flexible units (pages, dollars, hours, etc.) and optional
date ranges for time-bound objectives.

Example usage:
    # Create a savings goal
    goal = Goal.objects.create(
        user=user,
        name="Emergency Fund",
        description="Save for unexpected expenses",
        unit="dollars",
        target_value=Decimal('5000.00'),
        end_date=date(2025, 12, 31)
    )

    # Log progress toward the goal
    progress = GoalProgress.objects.create(
        goal=goal,
        amount=Decimal('250.00'),
        note="Monthly deposit"
    )
    goal.current_value += progress.amount
    goal.save()
"""
from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model


class Goal(models.Model):
    """
    Represents a measurable goal with a target value to achieve.

    Goals are flexible and can represent various objectives like saving money,
    reading books, or logging exercise hours. The unit field allows for
    customization of what is being measured.

    Attributes:
        user (ForeignKey): The user who owns this goal.
        name (str): Display name for the goal (max 100 characters).
        description (str): Optional detailed description of the goal.
        unit (str): Unit of measurement (e.g., 'dollars', 'pages', 'hours').
        target_value (Decimal): The target amount to achieve.
        current_value (Decimal): Current progress toward the target.
        start_date (date, optional): When to start tracking progress.
        end_date (date, optional): Deadline for achieving the goal.
        created_at (datetime): When the goal was created.
        updated_at (datetime): When the goal was last modified.

    Properties:
        progress_percentage: Returns current_value / target_value as percentage.
        is_complete: Returns True if current_value >= target_value.

    Example:
        >>> goal = Goal.objects.create(
        ...     user=user,
        ...     name="Read 24 books",
        ...     unit="books",
        ...     target_value=Decimal('24'),
        ...     end_date=date(2025, 12, 31)
        ... )
        >>> print(goal)
        Read 24 books (john_doe)
    """
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='goals',
        help_text="The user who owns this goal"
    )
    name = models.CharField(
        max_length=100,
        help_text="Display name for the goal"
    )
    description = models.TextField(
        blank=True,
        help_text="Optional detailed description of the goal"
    )
    unit = models.CharField(
        max_length=20,
        default='units',
        help_text="Unit of measurement (e.g., pages, dollars, hours)"
    )
    target_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('1.00'),
        help_text="Target amount to achieve"
    )
    current_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Current progress toward the target"
    )
    start_date = models.DateField(
        null=True,
        blank=True,
        help_text="Optional start date for the goal"
    )
    end_date = models.DateField(
        null=True,
        blank=True,
        help_text="Optional deadline for the goal"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'goal'
        verbose_name_plural = 'goals'

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    @property
    def progress_percentage(self):
        """Calculate progress as a percentage of the target."""
        if self.target_value == 0:
            return 0
        return min(100, (self.current_value / self.target_value) * 100)

    @property
    def is_complete(self):
        """Check if the goal has been achieved."""
        return self.current_value >= self.target_value


class GoalProgress(models.Model):
    """
    Records a single progress update toward a goal.

    Each progress entry represents an incremental step toward achieving
    a goal. Progress entries can include notes for context.

    Attributes:
        goal (ForeignKey): The goal this progress applies to.
        date (date): When the progress was made.
        amount (Decimal): The amount of progress made.
        note (str): Optional notes about this progress update.
        created_at (datetime): When this entry was created.

    Note:
        Creating a GoalProgress entry does NOT automatically update the
        parent Goal's current_value. This should be handled in the view
        or via a signal.

    Example:
        >>> progress = GoalProgress.objects.create(
        ...     goal=savings_goal,
        ...     amount=Decimal('100.00'),
        ...     note="Bonus from work"
        ... )
        >>> print(progress)
        100.00 dollars for Emergency Fund on 2025-12-05
    """
    goal = models.ForeignKey(
        Goal,
        on_delete=models.CASCADE,
        related_name='progress_entries',
        help_text="The goal this progress applies to"
    )
    date = models.DateField(
        auto_now_add=True,
        help_text="Date when the progress was recorded"
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Amount of progress made"
    )
    note = models.TextField(
        blank=True,
        help_text="Optional notes about this progress"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'goal progress'
        verbose_name_plural = 'goal progress entries'

    def __str__(self):
        return f"{self.amount} {self.goal.unit} for {self.goal.name} on {self.date}"
