# habits/urls.py
# This file will contain URL patterns for the habits app.

from rest_framework.routers import DefaultRouter
from .views import HabitViewSet, HabitLogViewSet

router = DefaultRouter()
router.register(r'', HabitViewSet, basename='habit')
router.register(r'logs', HabitLogViewSet, basename='habitlog')

urlpatterns = router.urls
