"""
goals/models.py
--------------
Defines database models for user goals and progress updates toward those goals.
"""
from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model

class Goal(models.Model):
	"""
	Represents a user-defined goal (e.g., 'Save $1000', 'Read 12 books').
	The unit field allows for flexible goal types (pages, dollars, hours, etc.).
	"""
	user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
	name = models.CharField(max_length=100)
	description = models.TextField(blank=True)
	unit = models.CharField(max_length=20, default='units')  # e.g., 'pages', 'dollars', 'hours'
	target_value = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('1.00'))
	current_value = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
	start_date = models.DateField(null=True, blank=True)
	end_date = models.DateField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"{self.name} ({self.user.username})"

class GoalProgress(models.Model):
	"""
	Represents a single progress update toward a goal (e.g., 'Saved $50 on 2025-11-30').
	"""
	goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='progress_entries')
	date = models.DateField(auto_now_add=True)
	amount = models.DecimalField(max_digits=10, decimal_places=2)
	note = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.amount} {self.goal.unit} for {self.goal.name} on {self.date}"
