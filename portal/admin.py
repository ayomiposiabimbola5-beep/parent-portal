from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from .models import Student, Result, Notification


class StudentInline(admin.TabularInline):
    model = Student
    extra = 0
    fields = ("name", "matric_number", "department", "level", "pin")
    readonly_fields = ("pin",)
    show_change_link = True


class ResultInline(admin.TabularInline):
    model = Result
    extra = 5
    fields = (
        "course_code",
        "course_title",
        "score",
        "grade",
        "semester",
        "session",
    )
    readonly_fields = ("grade",)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "matric_number",
        "parent",
        "department",
        "level",
        "pin",
    )
    search_fields = (
        "name",
        "matric_number",
        "department",
        "parent__username",
        "parent__email",
    )
    list_filter = ("department", "level")
    list_select_related = ("parent",)
    ordering = ("name",)
    list_per_page = 25

    fields = (
        "parent",
        "name",
        "matric_number",
        "department",
        "level",
        "pin",
    )
    readonly_fields = ("pin",)

    inlines = [ResultInline]


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "course_code",
        "course_title",
        "score",
        "grade",
        "semester",
        "session",
    )
    search_fields = (
        "student__name",
        "student__matric_number",
        "student__parent__username",
        "course_code",
        "course_title",
    )
    list_filter = ("grade", "semester", "session")
    list_select_related = ("student",)
    ordering = ("student__name", "session", "semester", "course_code")
    list_per_page = 50

    fields = (
        "student",
        "course_code",
        "course_title",
        "score",
        "grade",
        "semester",
        "session",
    )


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "parent",
        "created_at",
        "is_read",
    )
    search_fields = (
        "title",
        "message",
        "parent__username",
        "parent__email",
    )
    list_filter = ("is_read", "created_at")
    list_select_related = ("parent",)
    ordering = ("-created_at",)
    list_per_page = 25

    fields = (
        "parent",
        "title",
        "message",
        "is_read",
    )

    actions = ["mark_as_read"]

    @admin.action(description="Mark selected notifications as read")
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)


try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass


@admin.register(User)
class ParentUserAdmin(UserAdmin):
    list_display = (
        "username",
        "first_name",
        "last_name",
        "email",
        "student_count",
        "is_active",
        "is_staff",
    )
    search_fields = (
        "username",
        "first_name",
        "last_name",
        "email",
    )
    list_filter = ("is_active", "is_staff")
    ordering = ("username",)
    list_per_page = 25

    inlines = [StudentInline]

    def student_count(self, obj):
        return obj.students.count()

    student_count.short_description = "Students"