from django.urls import path
from .views import MultipleProductPageView, RandomProductsView
urlpatterns = [
    path('search', MultipleProductPageView.as_view(), name='multiple_product_page'),
    path('random', RandomProductsView.as_view(), name='random_products'),
]