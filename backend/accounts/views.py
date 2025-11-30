
"""
accounts/views.py
-----------------
Defines API endpoints for user registration and fetching the current authenticated user's info.
"""

from rest_framework import generics
from django.contrib.auth.models import User
from .serializers import RegisterSerializer

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer

class CurrentUserView(APIView):
	"""
	API endpoint to get the current authenticated user's info.
	"""
	permission_classes = [IsAuthenticated]

	def get(self, request):
		serializer = UserSerializer(request.user)
		return Response(serializer.data)

class RegisterView(generics.CreateAPIView):
	"""
	API endpoint for user registration.
	"""
	queryset = User.objects.all()
	serializer_class = RegisterSerializer
