# goals/urls.py
# This file will contain URL patterns for the goals app.

from rest_framework.routers import DefaultRouter
from .views import GoalViewSet, GoalProgressViewSet


router = DefaultRouter()
router.register(r'', GoalViewSet, basename='goal')
router.register(r'progress', GoalProgressViewSet, basename='goalprogress')

urlpatterns = router.urls
