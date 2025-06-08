from django.urls import path
from .views import ForgotPasswordView, ResetPasswordView
urlpatterns = [
    path('forgot_password', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset_password', ResetPasswordView.as_view(), name='reset_password'),
]