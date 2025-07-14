from django.urls import path
from .views import OrderSearchView, MarkOrderDispatchedView, ConfirmRefundView

urlpatterns = [
    path('searchorders', OrderSearchView.as_view(), name='searchorders'),
    path('dispatchorder', MarkOrderDispatchedView.as_view(), name='dispatchorder'),
    path('confirm_refund', ConfirmRefundView.as_view(), name='confirm_refund'),
]