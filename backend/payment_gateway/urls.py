from django.urls import path
from .views import CreateRazorpayOrder, VerifyPaymentView, run_delete_stale_orders
urlpatterns = [
    path('create_order', CreateRazorpayOrder.as_view(), name='create_order'),
    path('verify_payment', VerifyPaymentView.as_view(), name='verify_payment'),
    path('delete_stale_orders', run_delete_stale_orders, name='delete_stale_orders'),
]