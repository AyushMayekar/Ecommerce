"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('user_auth.urls')),
    path('', include('multiple_product_page.urls')),
    path('', include('admin_operations.urls')),
    path('', include('single_product_api.urls')),
    path('', include('payment_gateway.urls')),
    path('', include('forgot_password.urls')),
    path('', include('coldstart.urls')),
    path('', include('user_order_management.urls')),
    path('', include('admin_order_management.urls')),
    path('', include('profile_setup.urls')),
]
