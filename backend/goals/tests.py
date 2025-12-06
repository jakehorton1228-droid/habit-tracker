from decimal import Decimal
from datetime import date
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Goal, GoalProgress

User = get_user_model()


class GoalModelTests(TestCase):
    """Tests for Goal model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_create_goal(self):
        """Test creating a goal."""
        goal = Goal.objects.create(
            user=self.user,
            name='Save money',
            unit='dollars',
            target_value=Decimal('1000.00')
        )
        self.assertEqual(str(goal), 'Save money (testuser)')
        self.assertEqual(goal.current_value, Decimal('0.00'))

    def test_progress_percentage(self):
        """Test progress percentage calculation."""
        goal = Goal.objects.create(
            user=self.user,
            name='Save money',
            target_value=Decimal('100.00'),
            current_value=Decimal('25.00')
        )
        self.assertEqual(goal.progress_percentage, 25.0)

    def test_is_complete(self):
        """Test is_complete property."""
        goal = Goal.objects.create(
            user=self.user,
            name='Save money',
            target_value=Decimal('100.00'),
            current_value=Decimal('100.00')
        )
        self.assertTrue(goal.is_complete)

    def test_progress_percentage_exceeds_target(self):
        """Test progress percentage caps at 100."""
        goal = Goal.objects.create(
            user=self.user,
            name='Save money',
            target_value=Decimal('100.00'),
            current_value=Decimal('150.00')
        )
        self.assertEqual(goal.progress_percentage, 100)


class GoalAPITests(APITestCase):
    """Tests for Goal API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            password='testpass123'
        )
        self.goal = Goal.objects.create(
            user=self.user,
            name='Save money',
            unit='dollars',
            target_value=Decimal('1000.00')
        )

    def test_list_goals_authenticated(self):
        """Test listing goals when authenticated."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/goals/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_list_goals_unauthenticated(self):
        """Test listing goals fails when not authenticated."""
        response = self.client.get('/api/goals/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_goal(self):
        """Test creating a goal."""
        self.client.force_authenticate(user=self.user)
        data = {
            'name': 'Read books',
            'unit': 'books',
            'target_value': '24.00'
        }
        response = self.client.post('/api/goals/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Goal.objects.count(), 2)

    def test_update_goal(self):
        """Test updating a goal."""
        self.client.force_authenticate(user=self.user)
        data = {
            'name': 'Save more money',
            'unit': 'dollars',
            'target_value': '2000.00',
            'current_value': '500.00'
        }
        response = self.client.put(f'/api/goals/{self.goal.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.goal.refresh_from_db()
        self.assertEqual(self.goal.name, 'Save more money')
        self.assertEqual(self.goal.current_value, Decimal('500.00'))

    def test_delete_goal(self):
        """Test deleting a goal."""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f'/api/goals/{self.goal.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Goal.objects.count(), 0)

    def test_user_isolation(self):
        """Test that users can only see their own goals."""
        Goal.objects.create(
            user=self.other_user,
            name='Other Goal',
            target_value=Decimal('100.00')
        )
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/goals/')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['name'], 'Save money')

    def test_search_goals(self):
        """Test searching goals by name."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/goals/?search=money')
        self.assertEqual(response.data['count'], 1)


class GoalProgressAPITests(APITestCase):
    """Tests for GoalProgress API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            password='testpass123'
        )
        self.goal = Goal.objects.create(
            user=self.user,
            name='Save money',
            unit='dollars',
            target_value=Decimal('1000.00')
        )
        self.other_goal = Goal.objects.create(
            user=self.other_user,
            name='Other Goal',
            target_value=Decimal('100.00')
        )

    def test_create_progress(self):
        """Test logging progress toward a goal."""
        self.client.force_authenticate(user=self.user)
        data = {
            'goal': self.goal.id,
            'amount': '100.00',
            'note': 'Monthly savings'
        }
        response = self.client.post('/api/goals/progress/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_cannot_log_progress_for_other_users_goal(self):
        """Test that users cannot log progress for other users' goals."""
        self.client.force_authenticate(user=self.user)
        data = {
            'goal': self.other_goal.id,
            'amount': '50.00'
        }
        response = self.client.post('/api/goals/progress/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_progress(self):
        """Test listing progress entries."""
        GoalProgress.objects.create(goal=self.goal, amount=Decimal('100.00'))
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/goals/progress/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_filter_progress_by_goal(self):
        """Test filtering progress by goal."""
        goal2 = Goal.objects.create(
            user=self.user,
            name='Read books',
            target_value=Decimal('24.00')
        )
        GoalProgress.objects.create(goal=self.goal, amount=Decimal('100.00'))
        GoalProgress.objects.create(goal=goal2, amount=Decimal('1.00'))

        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/goals/progress/?goal={self.goal.id}')
        self.assertEqual(response.data['count'], 1)
