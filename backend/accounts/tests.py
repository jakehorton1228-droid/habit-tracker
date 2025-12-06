from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()


class UserRegistrationTests(APITestCase):
    """Tests for user registration endpoint."""

    def test_register_user_success(self):
        """Test successful user registration."""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, 'testuser')

    def test_register_user_missing_password(self):
        """Test registration fails without password."""
        data = {
            'username': 'testuser',
            'email': 'test@example.com'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_user_duplicate_username(self):
        """Test registration fails with duplicate username."""
        User.objects.create_user(username='testuser', password='testpass123')
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserLoginTests(APITestCase):
    """Tests for user login endpoint."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_login_success(self):
        """Test successful login returns tokens."""
        data = {'username': 'testuser', 'password': 'testpass123'}
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_invalid_credentials(self):
        """Test login fails with invalid credentials."""
        data = {'username': 'testuser', 'password': 'wrongpassword'}
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CurrentUserTests(APITestCase):
    """Tests for current user endpoint."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_get_current_user_authenticated(self):
        """Test getting current user when authenticated."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/user/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    def test_get_current_user_unauthenticated(self):
        """Test getting current user fails when not authenticated."""
        response = self.client.get('/api/auth/user/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
