"""
accounts/views.py
-----------------
REST API views for user authentication and account management.

This module provides views for user registration and profile retrieval.
Authentication is handled via JWT tokens provided by SimpleJWT.

Endpoints:
    Authentication:
        POST   /api/auth/register/       - Create a new user account
        POST   /api/auth/login/          - Obtain JWT tokens (via SimpleJWT)
        POST   /api/auth/token/refresh/  - Refresh access token (via SimpleJWT)
        GET    /api/auth/user/           - Get current user's profile

Security:
    - Registration is open to all (no authentication required)
    - Profile retrieval requires valid JWT authentication
    - Passwords are hashed using Django's create_user method
    - JWT tokens expire after a configured duration

Note:
    Login and token refresh endpoints are provided by rest_framework_simplejwt
    and configured in urls.py, not in this views module.
"""
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User

from .serializers import RegisterSerializer, UserSerializer


class CurrentUserView(APIView):
    """
    View for retrieving the current authenticated user's profile.

    Returns basic user information (id, username, email) for the
    authenticated user making the request.

    Attributes:
        permission_classes: Requires valid JWT authentication.

    Methods:
        get: Return the current user's profile data.

    Example:
        GET /api/auth/user/
        Authorization: Bearer <access_token>

        Response:
        {
            "id": 1,
            "username": "john_doe",
            "email": "john@example.com"
        }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Return the authenticated user's profile information.

        Args:
            request: The HTTP request with authenticated user.

        Returns:
            Response: JSON object containing user id, username, and email.
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class RegisterView(generics.CreateAPIView):
    """
    View for creating new user accounts.

    Handles user registration with username, email, and password.
    No authentication is required to access this endpoint.

    Attributes:
        queryset: All User objects (required by CreateAPIView).
        serializer_class: RegisterSerializer for validation and creation.

    Example:
        POST /api/auth/register/
        {
            "username": "new_user",
            "email": "user@example.com",
            "password": "securepassword123"
        }

        Response (201 Created):
        {
            "id": 2,
            "username": "new_user",
            "email": "user@example.com"
        }

    Note:
        After registration, users must call /api/auth/login/ to obtain
        JWT tokens for authenticated requests.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
