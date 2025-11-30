
"""
habits/models.py
---------------
Defines database models for user habits and habit logs (completions).
"""
from django.db import models


from django.contrib.auth import get_user_model

class Habit(models.Model):
	"""
	Represents a habit that a user wants to track (e.g., 'Read 10 pages').
	"""
	user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
	name = models.CharField(max_length=100)
	frequency = models.CharField(max_length=10, default='daily')  # 'daily', 'weekly', etc.
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"{self.name} ({self.user.username})"

class HabitLog(models.Model):
	"""
	Represents a single completion/log entry for a habit (e.g., 'Read 10 pages' on 2025-11-30).
	"""
	habit = models.ForeignKey(Habit, on_delete=models.CASCADE)
	date = models.DateField()
	note = models.TextField(blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.habit.name} on {self.date}"
