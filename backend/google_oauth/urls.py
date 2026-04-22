from .views import GoogleOAuthView
from django.urls import path

urlpatterns = [
    path('google_oauth', GoogleOAuthView.as_view(), name='google_oauth'),
]