from django.urls import path
from .views import UserOrdersView, CancelOrderView

urlpatterns = [
    path('user_orders', UserOrdersView.as_view(), name='user_orders'),
    path('cancel_order', CancelOrderView.as_view(), name='cancel_order'),
]