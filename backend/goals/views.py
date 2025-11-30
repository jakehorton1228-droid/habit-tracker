"""
goals/views.py
--------------
Defines API endpoints for managing user goals and progress updates.
Handles permissions and ensures users only access their own data.
"""
from rest_framework import viewsets
from .models import Goal, GoalProgress
from .serializers import GoalSerializer, GoalProgressSerializer

from rest_framework.permissions import IsAuthenticated


class GoalViewSet(viewsets.ModelViewSet):
	"""
	API endpoint for viewing and editing user's goals.
	Only returns goals belonging to the authenticated user.
	"""
	serializer_class = GoalSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		"""Return only goals for the current user."""
		return Goal.objects.filter(user=self.request.user)

	def perform_create(self, serializer):
		"""Set the user to the current user on creation."""
		serializer.save(user=self.request.user)


class GoalProgressViewSet(viewsets.ModelViewSet):
	"""
	API endpoint for viewing and creating progress updates toward goals.
	Only allows access to progress for goals owned by the authenticated user.
	"""
	serializer_class = GoalProgressSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		"""Return only progress entries for goals owned by the current user."""
		return GoalProgress.objects.filter(goal__user=self.request.user)

	def perform_create(self, serializer):
		"""Ensure users can only log progress for their own goals."""
		goal = serializer.validated_data.get('goal')
		if goal.user != self.request.user:
			from rest_framework.exceptions import PermissionDenied
			raise PermissionDenied("You do not have permission to log progress for this goal.")
		serializer.save()
