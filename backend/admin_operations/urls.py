from django.urls import path
from .views import AddProductView, DeleteProductView, UpdateProductView

urlpatterns = [
path('add', AddProductView.as_view(), name='Add_Product'),
path('delete/<str:sku>', DeleteProductView.as_view(), name='Delete_Product'),
path('update/<str:sku>', UpdateProductView.as_view(), name='Update_Product'),
]