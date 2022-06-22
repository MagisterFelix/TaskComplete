from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers
from rest_framework_jwt.settings import api_settings

from .models import User, Task, Subtask, Tag, Extra


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('name', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.CharField(max_length=40)
    password = serializers.CharField(max_length=40, write_only=True)
    token = serializers.CharField(max_length=255, read_only=True)

    def validate(self, data):
        JWT_PAYLOAD_HANDLER = api_settings.JWT_PAYLOAD_HANDLER
        JWT_ENCODE_HANDLER = api_settings.JWT_ENCODE_HANDLER

        email = data.get('email', None)
        password = data.get('password', None)

        user = authenticate(email=email, password=password)

        if user is None:
            raise serializers.ValidationError(
                'No user with this email and password was found.')

        payload = JWT_PAYLOAD_HANDLER(user)
        jwt_token = JWT_ENCODE_HANDLER(payload)
        update_last_login(None, user)
        response = {
            'email': user.email,
            'token': jwt_token
        }

        return response


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'email', 'password', 'name', 'image', 'premium'
        )
        extra_kwargs = {'email': {'required': False}, 'password': {'required': False}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class TaskSerializer(serializers.ModelSerializer):
    date = serializers.DateField(required=False)
    title = serializers.CharField(required=False)

    class Meta:
        model = Task
        fields = (
            'owner', 'date', 'title', 'description', 'priority', 'reminder', 'done'
        )

    def validate(self, data):
        if data.get('done') is None:
            errors = {}
            if data.get('date') is None:
                errors['date'] = 'Date field is required.'
            if data.get('title') is None:
                errors['title'] = 'Title field is required.'
            if errors:
                raise serializers.ValidationError(errors)
        return data


class SubtaskSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=False)

    class Meta:
        model = Subtask
        fields = (
            'task', 'title', 'done'
        )

    def validate(self, data):
        if data.get('done') is None:
            errors = {}
            if data.get('title') is None:
                errors['title'] = 'Title field is required.'
            if errors:
                raise serializers.ValidationError(errors)
        return data


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = (
            'task', 'title'
        )


class ExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Extra
        fields = (
            'task', 'information'
        )
