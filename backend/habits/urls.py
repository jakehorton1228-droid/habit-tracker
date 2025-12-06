# habits/urls.py
# This file will contain URL patterns for the habits app.

from rest_framework.routers import DefaultRouter
from .views import HabitViewSet, HabitLogViewSet

router = DefaultRouter()
# Register logs first so it takes precedence over the greedy '' pattern
router.register(r'logs', HabitLogViewSet, basename='habitlog')
router.register(r'', HabitViewSet, basename='habit')

urlpatterns = router.urls
