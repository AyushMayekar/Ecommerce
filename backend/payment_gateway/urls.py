from django.urls import path
from .views import CreateRazorpayOrder, VerifyPaymentView
urlpatterns = [
    path('create_order', CreateRazorpayOrder.as_view(), name='create_order'),
    path('verify_payment', VerifyPaymentView.as_view(), name='verify_payment'),
]