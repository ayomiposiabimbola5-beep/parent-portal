from django.urls import path
from . import views

urlpatterns = [
    path("students/", views.students),
    path("results/", views.results),
    path("notifications/", views.notifications),
    path("login/", views.login),
    path("logout/", views.logout),
    path("link-ward/", views.link_ward, name="link_ward"),
    path("profile/", views.profile),
    path("change-password/", views.change_password),

    # School administrator / parent account management
    path("admin/parents/", views.admin_parents),
    path("admin/parents/<int:parent_id>/status/", views.admin_parent_status),

    # Notification actions
    path("notifications/<int:notification_id>/read/", views.mark_notification_read),
    path("notifications/mark-all-read/", views.mark_all_notifications_read),
    path("notifications/unread-count/", views.unread_notification_count),
]
