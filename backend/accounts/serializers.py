"""
accounts/serializers.py
-----------------------
REST API serializers for user authentication and account management.

This module provides serializers for user registration and profile retrieval
using Django's built-in User model with JWT authentication.

Serializers:
    - UserSerializer: Returns user profile information
    - RegisterSerializer: Handles new user registration

Example API responses:
    # GET /api/auth/user/
    {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com"
    }

    # POST /api/auth/register/
    {
        "id": 1,
        "username": "new_user",
        "email": "user@example.com"
    }
"""
from django.contrib.auth.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving user profile information.

    Provides read-only access to basic user information for authenticated
    requests. Used by the /api/auth/user/ endpoint.

    Fields:
        id (int): Unique user identifier.
        username (str): User's username.
        email (str): User's email address.

    Example:
        >>> user = User.objects.get(username='john_doe')
        >>> serializer = UserSerializer(user)
        >>> serializer.data
        {'id': 1, 'username': 'john_doe', 'email': 'john@example.com'}
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.

    Handles new user creation with proper password hashing. The password
    field is write-only and is never included in response data.

    Fields:
        id (int): Unique user identifier (read-only, returned after creation).
        username (str): Desired username (required, must be unique).
        email (str): User's email address (optional).
        password (str): User's password (write-only, will be hashed).

    Validation:
        - Username must be unique across all users.
        - Password is hashed using Django's create_user method.

    Example:
        # Register a new user (POST /api/auth/register/)
        >>> data = {
        ...     "username": "new_user",
        ...     "email": "user@example.com",
        ...     "password": "securepassword123"
        ... }
        >>> serializer = RegisterSerializer(data=data)
        >>> serializer.is_valid()
        True
        >>> user = serializer.save()
        >>> user.username
        'new_user'
    """
    password = serializers.CharField(
        write_only=True,
        help_text="User's password (will be hashed, never returned in responses)"
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        """
        Create a new user with a properly hashed password.

        Args:
            validated_data: Dict containing username, email, and password.

        Returns:
            User: The newly created user instance.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user
