from datetime import date, time
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from .models import JournalEntry

User = get_user_model()


class JournalEntryModelTests(TestCase):
    """Tests for JournalEntry model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_create_freeform_entry(self):
        """Test creating a freeform journal entry."""
        entry = JournalEntry.objects.create(
            user=self.user,
            date=date.today(),
            time=time(20, 30),
            entry_type='freeform',
            mood='good',
            content='Had a great day today!'
        )
        self.assertIn('testuser', str(entry))
        self.assertEqual(entry.mood, 'good')

    def test_create_prompted_entry(self):
        """Test creating a prompted journal entry."""
        entry = JournalEntry.objects.create(
            user=self.user,
            date=date.today(),
            time=time(21, 0),
            entry_type='prompted',
            mood='great',
            responses={
                'gratitude': 'Grateful for sunny weather',
                'highlight': 'Finished my project'
            }
        )
        self.assertEqual(entry.entry_type, 'prompted')
        self.assertIn('gratitude', entry.responses)


class JournalEntryAPITests(APITestCase):
    """Tests for JournalEntry API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            password='testpass123'
        )
        self.entry = JournalEntry.objects.create(
            user=self.user,
            date=date.today(),
            time=time(20, 30),
            entry_type='freeform',
            mood='good',
            content='Test entry content'
        )

    def test_list_entries_authenticated(self):
        """Test listing journal entries when authenticated."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/journal/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_list_entries_unauthenticated(self):
        """Test listing entries fails when not authenticated."""
        response = self.client.get('/api/journal/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_freeform_entry(self):
        """Test creating a freeform journal entry."""
        self.client.force_authenticate(user=self.user)
        data = {
            'date': str(date.today()),
            'time': '21:00:00',
            'entry_type': 'freeform',
            'mood': 'great',
            'content': 'Another great day!'
        }
        response = self.client.post('/api/journal/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(JournalEntry.objects.count(), 2)

    def test_create_prompted_entry(self):
        """Test creating a prompted journal entry."""
        self.client.force_authenticate(user=self.user)
        data = {
            'date': str(date.today()),
            'time': '22:00:00',
            'entry_type': 'prompted',
            'mood': 'good',
            'responses': {
                'gratitude': 'Family',
                'highlight': 'Completed a workout'
            }
        }
        response = self.client.post('/api/journal/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update_entry(self):
        """Test updating a journal entry."""
        self.client.force_authenticate(user=self.user)
        data = {
            'date': str(date.today()),
            'time': '20:30:00',
            'entry_type': 'freeform',
            'mood': 'great',
            'content': 'Updated content'
        }
        response = self.client.put(f'/api/journal/{self.entry.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.entry.refresh_from_db()
        self.assertEqual(self.entry.content, 'Updated content')
        self.assertEqual(self.entry.mood, 'great')

    def test_delete_entry(self):
        """Test deleting a journal entry."""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f'/api/journal/{self.entry.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(JournalEntry.objects.count(), 0)

    def test_user_isolation(self):
        """Test that users can only see their own entries."""
        JournalEntry.objects.create(
            user=self.other_user,
            date=date.today(),
            time=time(19, 0),
            mood='okay',
            content='Other user entry'
        )
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/journal/')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['content'], 'Test entry content')

    def test_filter_by_mood(self):
        """Test filtering entries by mood."""
        JournalEntry.objects.create(
            user=self.user,
            date=date.today(),
            time=time(21, 0),
            mood='great',
            content='Great day!'
        )
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/journal/?mood=good')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['mood'], 'good')

    def test_filter_by_entry_type(self):
        """Test filtering entries by entry type."""
        JournalEntry.objects.create(
            user=self.user,
            date=date.today(),
            time=time(21, 0),
            entry_type='prompted',
            mood='good',
            responses={'gratitude': 'Test'}
        )
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/journal/?entry_type=freeform')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['entry_type'], 'freeform')

    def test_search_entries(self):
        """Test searching entries by content."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/journal/?search=test')
        self.assertEqual(response.data['count'], 1)
