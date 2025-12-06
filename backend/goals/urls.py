# goals/urls.py
# This file will contain URL patterns for the goals app.

from rest_framework.routers import DefaultRouter
from .views import GoalViewSet, GoalProgressViewSet


router = DefaultRouter()
# Register progress first so it takes precedence over the greedy '' pattern
router.register(r'progress', GoalProgressViewSet, basename='goalprogress')
router.register(r'', GoalViewSet, basename='goal')

urlpatterns = router.urls
