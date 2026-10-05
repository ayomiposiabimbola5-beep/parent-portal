from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from .models import Student, Result, Notification


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("name", "matric_number", "department", "level", "parent")
    search_fields = ("name", "matric_number", "department")
    list_filter = ("department", "level")


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ("student", "course_code", "course_title", "score", "grade", "semester", "session")
    search_fields = ("student__name", "student__matric_number", "course_code", "course_title")
    list_filter = ("grade", "semester", "session")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "parent", "created_at", "is_read")
    search_fields = ("title", "message", "parent__username", "parent__email")
    list_filter = ("is_read", "created_at")


# Use Django's built-in User model for parent accounts.
# The existing Django Admin Users page can create parent accounts directly.
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass


@admin.register(User)
class ParentUserAdmin(UserAdmin):
    list_display = ("username", "first_name", "last_name", "email", "is_active", "is_staff")
    search_fields = ("username", "first_name", "last_name", "email")
    list_filter = ("is_active", "is_staff")
