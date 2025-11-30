# accounts/urls.py
# This file will contain URL patterns for the accounts app.


# URL patterns for accounts app
from django.urls import path
from .views import RegisterView, CurrentUserView

# JWT views
from rest_framework_simplejwt.views import (
	TokenObtainPairView,
	TokenRefreshView,
)

urlpatterns = [
	path('register/', RegisterView.as_view(), name='register'),
	path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path('user/', CurrentUserView.as_view(), name='current_user'),
]
