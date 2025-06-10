from django.urls import path
from .views import RegisterView, LoginView, LogoutView, ProtectedView, RefreshTokenView, CheckAuthView
urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('logout', LogoutView.as_view(), name='logout'),
    path('protected', ProtectedView.as_view(), name='protected'),
    path('refresh', RefreshTokenView.as_view(), name='refresh_token'),
    path('check_auth', CheckAuthView.as_view(), name='check_auth'),
]