from rest_framework import serializers
from .models import Student, Result, Notification


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'id',
            'name',
            'matric_number',
            'department',
            'level'
        ]


class ResultSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = Result 
        fields = [ 
            'id', 
            'student', 
            'course_code', 
            'course_title', 
            'score', 
            'grade', 
            'semester', 
            'session' 
            ]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'message',
            'created_at',
            'is_read'
        ]