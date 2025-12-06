from datetime import date
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Habit, HabitLog

User = get_user_model()


class HabitModelTests(TestCase):
    """Tests for Habit model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_create_habit(self):
        """Test creating a habit."""
        habit = Habit.objects.create(
            user=self.user,
            name='Exercise',
            category='health',
            frequency='daily'
        )
        self.assertEqual(str(habit), 'Exercise (testuser)')
        self.assertEqual(habit.category, 'health')

    def test_habit_log_str_representation(self):
        """Test string representation of habit log."""
        habit = Habit.objects.create(
            user=self.user,
            name='Exercise',
            category='health'
        )
        log = HabitLog.objects.create(habit=habit, date=date.today())
        self.assertEqual(str(log), f'Exercise on {date.today()}')


class HabitAPITests(APITestCase):
    """Tests for Habit API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            password='testpass123'
        )
        self.habit = Habit.objects.create(
            user=self.user,
            name='Exercise',
            category='health',
            frequency='daily'
        )

    def test_list_habits_authenticated(self):
        """Test listing habits when authenticated."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/habits/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_list_habits_unauthenticated(self):
        """Test listing habits fails when not authenticated."""
        response = self.client.get('/api/habits/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_habit(self):
        """Test creating a habit."""
        self.client.force_authenticate(user=self.user)
        data = {
            'name': 'Read',
            'category': 'learning',
            'frequency': 'daily'
        }
        response = self.client.post('/api/habits/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Habit.objects.count(), 2)

    def test_update_habit(self):
        """Test updating a habit."""
        self.client.force_authenticate(user=self.user)
        data = {'name': 'Morning Exercise', 'category': 'health', 'frequency': 'daily'}
        response = self.client.put(f'/api/habits/{self.habit.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.habit.refresh_from_db()
        self.assertEqual(self.habit.name, 'Morning Exercise')

    def test_delete_habit(self):
        """Test deleting a habit."""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f'/api/habits/{self.habit.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Habit.objects.count(), 0)

    def test_user_isolation(self):
        """Test that users can only see their own habits."""
        other_habit = Habit.objects.create(
            user=self.other_user,
            name='Other Habit',
            category='health'
        )
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/habits/')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['name'], 'Exercise')

    def test_filter_by_category(self):
        """Test filtering habits by category."""
        Habit.objects.create(
            user=self.user,
            name='Read',
            category='learning'
        )
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/habits/?category=health')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['category'], 'health')

    def test_search_habits(self):
        """Test searching habits by name."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/habits/?search=exercise')
        self.assertEqual(response.data['count'], 1)


class HabitLogAPITests(APITestCase):
    """Tests for HabitLog API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            password='testpass123'
        )
        self.habit = Habit.objects.create(
            user=self.user,
            name='Exercise',
            category='health'
        )
        self.other_habit = Habit.objects.create(
            user=self.other_user,
            name='Other Habit',
            category='health'
        )

    def test_create_habit_log(self):
        """Test logging a habit completion."""
        self.client.force_authenticate(user=self.user)
        data = {
            'habit': self.habit.id,
            'date': str(date.today()),
            'note': 'Great workout!'
        }
        response = self.client.post('/api/habits/logs/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_cannot_log_other_users_habit(self):
        """Test that users cannot log other users' habits."""
        self.client.force_authenticate(user=self.user)
        data = {
            'habit': self.other_habit.id,
            'date': str(date.today())
        }
        response = self.client.post('/api/habits/logs/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_habit_logs(self):
        """Test listing habit logs."""
        HabitLog.objects.create(habit=self.habit, date=date.today())
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/habits/logs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_filter_logs_by_habit(self):
        """Test filtering logs by habit."""
        habit2 = Habit.objects.create(user=self.user, name='Read', category='learning')
        HabitLog.objects.create(habit=self.habit, date=date.today())
        HabitLog.objects.create(habit=habit2, date=date.today())

        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/habits/logs/?habit={self.habit.id}')
        self.assertEqual(response.data['count'], 1)
