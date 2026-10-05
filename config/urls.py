"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
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
from portal import views


urlpatterns = [
    # Django admin
    path("admin/", admin.site.urls),

    # API
    path("api/", include("portal.urls")),

    # Frontend pages
    path("", views.home_page, name="home"),
    path("parent-login/", views.parent_login_page, name="parent-login"),
    path("parent-dashboard/", views.parent_dashboard_page, name="parent-dashboard"),
    path("results/", views.results_page, name="results"),
    path("my-wards/", views.my_wards_page, name="my-wards"),
    path("notifications/", views.notifications_page, name="notifications"),
    path("account-settings/", views.account_settings_page, name="account-settings"),
    path("portal-admin/", views.admin_page, name="portal-admin"),
]