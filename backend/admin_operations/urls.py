from django.urls import path
from .views import AddProductView, DeleteProductView, UpdateProductView, ReadProductView

urlpatterns = [
path('add', AddProductView.as_view(), name='Add_Product'),
path('delete/<str:sku>', DeleteProductView.as_view(), name='Delete_Product'),
path('update/<str:sku>', UpdateProductView.as_view(), name='Update_Product'),
path('read', ReadProductView.as_view(), name='Read_Product'),
]