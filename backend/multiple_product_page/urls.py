from django.urls import path
from .views import MultipleProductPageView
urlpatterns = [
    path('search', MultipleProductPageView.as_view(), name='multiple_product_page'),
]