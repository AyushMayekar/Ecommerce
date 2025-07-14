from django.urls import path
from .views import BlockUserView, UserInfoView, SaveUserProfileView, VerifyPhoneView, ConfirmEmailVerificationView, SendEmailVerificationView

urlpatterns = [
    path('block_user', BlockUserView.as_view(), name='block_user'),
    path('profile_setup', UserInfoView.as_view(), name='profile_setup'),
    path('save_profile', SaveUserProfileView.as_view(), name='save_profile'),
    path('verify_phone', VerifyPhoneView.as_view(), name='verify_phone'),
    path('verify_email', SendEmailVerificationView.as_view(), name='verify_email'),
    path('confirm_email_verification', ConfirmEmailVerificationView.as_view(), name='confirm_email_verification'),
    ]