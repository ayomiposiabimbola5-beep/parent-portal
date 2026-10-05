from django.shortcuts import render
from django.contrib.auth import authenticate, login as django_login, logout as django_logout, update_session_auth_hash
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes
from rest_framework.response import Response

from .models import Student, Result, Notification
from .serializers import StudentSerializer, ResultSerializer, NotificationSerializer


def session_user(request):
    user_id = request.session.get("_auth_user_id")
    if not user_id:
        return None
    try:
        return User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return None


def auth_required_response():
    return Response(
        {"success": False, "message": "Authentication required."},
        status=status.HTTP_401_UNAUTHORIZED,
    )


def staff_required_response():
    return Response(
        {"success": False, "message": "Administrator access required."},
        status=status.HTTP_403_FORBIDDEN,
    )


@api_view(["GET"])
def students(request):
    if not request.user.is_authenticated:
        return auth_required_response()

    queryset = Student.objects.filter(parent=request.user).order_by("name")
    return Response(StudentSerializer(queryset, many=True).data)


@csrf_exempt
@api_view(["GET"])
@authentication_classes([])
def results(request):
    user = session_user(request)
    if not user:
        return auth_required_response()

    queryset = Result.objects.filter(student__parent=user).select_related("student")
    return Response(ResultSerializer(queryset, many=True).data)


@csrf_exempt
@api_view(["GET"])
@authentication_classes([])
def notifications(request):
    user = session_user(request)
    if not user:
        return auth_required_response()

    queryset = Notification.objects.filter(parent=user).order_by("-created_at")
    return Response(NotificationSerializer(queryset, many=True).data)


@api_view(["POST"])
@authentication_classes([])
def login(request):
    username = str(request.data.get("username", "")).strip()
    password = request.data.get("password", "")

    if not username or not password:
        return Response(
            {"success": False, "message": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request=request, username=username, password=password)

    if user is None:
        return Response(
            {"success": False, "message": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {"success": False, "message": "This account is inactive. Contact the administrator."},
            status=status.HTTP_403_FORBIDDEN,
        )

    django_login(request, user)

    return Response({
        "success": True,
        "message": "Login successful",
        "username": user.username,
        "full_name": f"{user.first_name} {user.last_name}".strip(),
        "is_staff": user.is_staff,
    })


@csrf_exempt
@api_view(["POST"])
@authentication_classes([])
def logout(request):
    django_logout(request)
    return Response({"success": True, "message": "Logout successful."})


@csrf_exempt
@api_view(["POST"])
@authentication_classes([])
def link_ward(request):

    user = session_user(request)

    if not user:
        return Response(
            {"success": False, "message": "Authentication required."},
            status=status.HTTP_401_UNAUTHORIZED
        )


    student_id = request.data.get("student_id")
    pin = request.data.get("pin")


    if not student_id or not pin:

        return Response(
            {
                "success": False,
                "message": "Student ID and PIN are required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    try:

        student = Student.objects.get(
            matric_number__iexact=student_id
        )

    except Student.DoesNotExist:

        return Response(
            {
                "success": False,
                "message": "Student record not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )


    if str(student.pin) != str(pin):

        return Response(
            {
                "success": False,
                "message": "Invalid Student ID or PIN."
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    if (
        student.parent_id
        and student.parent_id != user.id
    ):

        return Response(
            {
                "success": False,
                "message":
                    "This student is already linked to another parent account."
            },
            status=status.HTTP_409_CONFLICT
        )


    student.parent = user

    student.save(
        update_fields=["parent"]
    )


    return Response(
        {
            "success": True,
            "message": "Ward linked successfully.",
            "student":
                StudentSerializer(student).data
        }
    )

@csrf_exempt
@api_view(["GET", "PUT"])
@authentication_classes([])
def profile(request):
    user = session_user(request)
    if not user:
        return auth_required_response()

    if request.method == "GET":
        return Response({
            "success": True,
            "username": user.username,
            "full_name": f"{user.first_name} {user.last_name}".strip(),
            "email": user.email,
        })

    full_name = str(request.data.get("full_name", "")).strip()
    email = str(request.data.get("email", "")).strip()

    if not full_name or not email:
        return Response(
            {"success": False, "message": "Full name and email are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    name_parts = full_name.split(maxsplit=1)
    user.first_name = name_parts[0]
    user.last_name = name_parts[1] if len(name_parts) > 1 else ""
    user.email = email
    user.save(update_fields=["first_name", "last_name", "email"])

    return Response({
        "success": True,
        "message": "Profile updated successfully.",
        "full_name": full_name,
        "email": email,
    })


@csrf_exempt
@api_view(["POST"])
@authentication_classes([])
def change_password(request):
    user = session_user(request)
    if not user:
        return auth_required_response()

    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    if not current_password or not new_password:
        return Response(
            {"success": False, "message": "Current password and new password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not user.check_password(current_password):
        return Response(
            {"success": False, "message": "Current password is incorrect."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        validate_password(new_password, user=user)
    except ValidationError as exc:
        return Response(
            {"success": False, "message": " ".join(exc.messages)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save(update_fields=["password"])
    update_session_auth_hash(request, user)

    return Response({"success": True, "message": "Password updated successfully."})


# ---------------------------------------------------------------------------
# ADMIN / SCHOOL MANAGEMENT
# ---------------------------------------------------------------------------

@csrf_exempt
@api_view(["GET", "POST"])
@authentication_classes([])
def admin_parents(request):
    admin_user = session_user(request)
    if not admin_user:
        return auth_required_response()
    if not admin_user.is_staff:
        return staff_required_response()

    if request.method == "GET":
        parents = User.objects.filter(is_staff=False).order_by("username")
        data = []
        for parent in parents:
            data.append({
                "id": parent.id,
                "username": parent.username,
                "first_name": parent.first_name,
                "last_name": parent.last_name,
                "full_name": f"{parent.first_name} {parent.last_name}".strip(),
                "email": parent.email,
                "is_active": parent.is_active,
                "linked_wards": parent.students.count(),
            })
        return Response(data)

    username = str(request.data.get("username", "")).strip()
    password = request.data.get("password", "")
    first_name = str(request.data.get("first_name", "")).strip()
    last_name = str(request.data.get("last_name", "")).strip()
    email = str(request.data.get("email", "")).strip()

    if not username or not password or not first_name or not email:
        return Response(
            {"success": False, "message": "Username, password, first name and email are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username__iexact=username).exists():
        return Response(
            {"success": False, "message": "That username is already in use."},
            status=status.HTTP_409_CONFLICT,
        )

    try:
        validate_password(password)
    except ValidationError as exc:
        return Response(
            {"success": False, "message": " ".join(exc.messages)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    parent = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        is_staff=False,
        is_superuser=False,
        is_active=True,
    )

    return Response({
        "success": True,
        "message": "Parent account created successfully.",
        "parent": {
            "id": parent.id,
            "username": parent.username,
            "full_name": f"{parent.first_name} {parent.last_name}".strip(),
            "email": parent.email,
        },
    }, status=status.HTTP_201_CREATED)


@csrf_exempt
@api_view(["PATCH"])
@authentication_classes([])
def admin_parent_status(request, parent_id):
    admin_user = session_user(request)
    if not admin_user:
        return auth_required_response()
    if not admin_user.is_staff:
        return staff_required_response()

    try:
        parent = User.objects.get(pk=parent_id, is_staff=False)
    except User.DoesNotExist:
        return Response(
            {"success": False, "message": "Parent account not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if "is_active" not in request.data:
        return Response(
            {"success": False, "message": "is_active is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    parent.is_active = bool(request.data.get("is_active"))
    parent.save(update_fields=["is_active"])

    return Response({
        "success": True,
        "message": "Parent account status updated.",
        "is_active": parent.is_active,
    })


# ---------------------------------------------------------------------------
# NOTIFICATION ACTIONS
# ---------------------------------------------------------------------------

@csrf_exempt
@api_view(["POST"])
@authentication_classes([])
def mark_notification_read(request, notification_id):
    user = session_user(request)
    if not user:
        return auth_required_response()

    try:
        notification = Notification.objects.get(id=notification_id, parent=user)
    except Notification.DoesNotExist:
        return Response(
            {"success": False, "message": "Notification not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    notification.is_read = True
    notification.save(update_fields=["is_read"])

    return Response({"success": True, "message": "Notification marked as read."})


@csrf_exempt
@api_view(["POST"])
@authentication_classes([])
def mark_all_notifications_read(request):
    user = session_user(request)
    if not user:
        return auth_required_response()

    updated = Notification.objects.filter(parent=user, is_read=False).update(is_read=True)
    return Response({
        "success": True,
        "message": "All notifications marked as read.",
        "updated": updated,
    })


@csrf_exempt
@api_view(["GET"])
@authentication_classes([])
def unread_notification_count(request):
    user = session_user(request)
    if not user:
        return auth_required_response()

    count = Notification.objects.filter(parent=user, is_read=False).count()
    return Response({"success": True, "unread_count": count})

# ---------------------------------------------------------------------------
# FRONTEND PAGES
# ---------------------------------------------------------------------------

def home_page(request):
    return render(request, "index.html")


def parent_login_page(request):
    return render(request, "parent-login.html")


def parent_dashboard_page(request):
    return render(request, "parent-dashboard.html")


def results_page(request):
    return render(request, "results.html")


def my_wards_page(request):
    return render(request, "my-wards.html")


def notifications_page(request):
    return render(request, "notifications.html")


def account_settings_page(request):
    return render(request, "account-settings.html")


def admin_page(request):
    return render(request, "admin.html")