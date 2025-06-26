from django.urls import path
from .views import PendingDispatchOrdersView, MarkOrderDispatchedView, ConfirmRefundView, PendingRefundOrdersView

urlpatterns = [
    path('admin_view_orders', PendingDispatchOrdersView.as_view(), name='pending-dispatch-orders'),
    path('admin_dispatch_order', MarkOrderDispatchedView.as_view(), name='mark-order-dispatched'),
    path('confirm_refund', ConfirmRefundView.as_view(), name='confirm-refund'),
    path('admin_view_refund_orders', PendingRefundOrdersView.as_view(), name='pending-refund-orders'),
]