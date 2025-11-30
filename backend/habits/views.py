"""
habits/views.py
----------------
Defines API endpoints for managing user habits and habit logs (completions).
Handles permissions and ensures users only access their own data.
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Habit, HabitLog
from .serializers import HabitSerializer, HabitLogSerializer

class HabitViewSet(viewsets.ModelViewSet):
	"""
	API endpoint for viewing and editing user's habits.
	Only returns habits belonging to the authenticated user.
	"""
	serializer_class = HabitSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		"""Return only habits for the current user."""
		return Habit.objects.filter(user=self.request.user)

	def perform_create(self, serializer):
		"""Set the user to the current user on creation."""
		serializer.save(user=self.request.user)

class HabitLogViewSet(viewsets.ModelViewSet):
	"""
	API endpoint for viewing and creating habit logs (completions).
	Only allows access to logs for habits owned by the authenticated user.
	"""
	serializer_class = HabitLogSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		"""Return only logs for habits owned by the current user."""
		return HabitLog.objects.filter(habit__user=self.request.user)

	def perform_create(self, serializer):
		"""Ensure users can only log completions for their own habits."""
		habit = serializer.validated_data.get('habit')
		if habit.user != self.request.user:
			from rest_framework.exceptions import PermissionDenied
			raise PermissionDenied("You do not have permission to log this habit.")
		serializer.save()
