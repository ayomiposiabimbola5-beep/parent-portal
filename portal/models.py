from django.db import models
from django.contrib.auth.models import User
import random


class Student(models.Model):

    parent = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="students",
        null=True,
        blank=True
    )

    name = models.CharField(max_length=100)

    matric_number = models.CharField(
        max_length=50,
        unique=True
    )

    department = models.CharField(
        max_length=100
    )

    level = models.CharField(
        max_length=20
    )

    pin = models.CharField(
    max_length=4,
    unique=True,
    blank=True
    )
    def save(self, *args, **kwargs):

        # Generate a PIN only when creating a new student
        if not self.pk and not self.pin:

            while True:

                new_pin = str(
                    random.randint(1000, 9999)
                )

                # Make sure the PIN is not already used
                if not Student.objects.filter(
                    pin=new_pin
                ).exists():

                    self.pin = new_pin

                    break


        super().save(*args, **kwargs)


    def __str__(self):

        return self.name


class Result(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="results"
    )
    course_code = models.CharField(max_length=20)
    course_title = models.CharField(max_length=200)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=5, blank=True)
    semester = models.CharField(
    max_length=50,
    choices=[
        ("First Semester", "First Semester"),
        ("Second Semester", "Second Semester"),
    ],
    )

    session = models.CharField(
    max_length=20,
    choices=[
        ("2025/2026", "2025/2026"),
        ("2026/2027", "2026/2027"),
        ("2027/2028", "2027/2028"),
    ],
    )

    def save(self, *args, **kwargs):
        if self.score >= 70:
            self.grade = "A"
        elif self.score >= 60:
            self.grade = "B"
        elif self.score >= 50:
            self.grade = "C"
        elif self.score >= 45:
            self.grade = "D"
        elif self.score >= 40:
            self.grade = "E"
        else:
            self.grade = "F"

        super().save(*args, **kwargs)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "course_code", "semester", "session"],
                name="unique_student_course_semester_session",
            )
        ]

    def __str__(self):
        return f"{self.student.name} - {self.course_code}"

class Notification(models.Model):
    parent = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    title = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return self.title