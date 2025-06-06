from django.urls import path
from .views import ProductDetailView, AddToCartView, DeleteCartItemView, ViewCartView, UpdateCartItemView
urlpatterns = [
    path('single_product/<str:sku>', ProductDetailView.as_view(), name='single_product'),
    path('add_to_cart', AddToCartView.as_view(), name='add_to_cart'),
    path('delete_cart', DeleteCartItemView.as_view(), name='delete_cart'),
    path('view_cart', ViewCartView.as_view(), name='view_cart'),
    path('update_cart', UpdateCartItemView.as_view(), name='update_cart'),
] 