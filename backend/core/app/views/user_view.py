from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_jwt.authentication import JSONWebTokenAuthentication

from core.app.models import User
from core.app.serializers import UserRegistrationSerializer, UserLoginSerializer, ProfileSerializer


AUTH_FAILS = {
    'email': 'User must have an email.',
    'password': 'User must have a password.'
}


class UserRegistrationView(APIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = (AllowAny,)

    def post(self, request):
        for key, value in AUTH_FAILS.items():
            if not request.data.get(key):
                success = False
                status_code = status.HTTP_400_BAD_REQUEST
                message = value
                break
        else:
            serializer = self.serializer_class(data=request.data)

            if serializer.is_valid():
                serializer.save()
                success = True
                status_code = status.HTTP_201_CREATED
                message = 'User registered successfully.'
            else:
                success = False
                message = ''
                for value in serializer.errors.values():
                    message += value[0][:-1].capitalize() + '.'
                status_code = status.HTTP_400_BAD_REQUEST

        response = {
            'success': success,
            'status_code': status_code,
            'message': message,
        }

        return Response(response, status=status_code)


class UserLoginView(APIView):
    serializer_class = UserLoginSerializer
    permission_classes = (AllowAny,)

    def post(self, request):
        for key, value in AUTH_FAILS.items():
            if not request.data.get(key):
                success = False
                status_code = status.HTTP_400_BAD_REQUEST
                message = value
                token = None
                break
        else:
            serializer = self.serializer_class(data=request.data)

            if serializer.is_valid():
                success = True
                status_code = status.HTTP_200_OK
                message = 'User logged in successfully.'
                token = serializer.data['token']
            else:
                success = False
                message = ''
                for value in serializer.errors.values():
                    message += value[0][:-1].capitalize() + '.'
                status_code = status.HTTP_404_NOT_FOUND
                token = None

        response = {
            'success': success,
            'status_code': status_code,
            'message': message,
            'token': token
        }

        return Response(response, status=status_code)


class UserProfileView(APIView):
    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated,)
    authentication_class = JSONWebTokenAuthentication

    def get(self, request):
        user = User.objects.get(email=request.user)

        success = True
        status_code = status.HTTP_200_OK
        message = 'User profile received successfully.'
        data = {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'image': user.image,
            'is_staff': user.is_staff,
            'premium':  bool(user.premium)
        }

        response = {
            'success': success,
            'status code': status_code,
            'message': message,
            'data': data
        }

        return Response(response, status=status_code)

    def put(self, request):
        user = User.objects.get(email=request.user)

        serializer = self.serializer_class(user, data=request.data)

        if serializer.is_valid():
            serializer.save()
            success = True
            status_code = status.HTTP_200_OK
            message = 'User updated successfully.'
        else:
            success = False
            message = ''
            for value in serializer.errors.values():
                message += value[0][:-1].capitalize() + '.'
            status_code = status.HTTP_400_BAD_REQUEST

        response = {
            'success': success,
            'status_code': status_code,
            'message': message
        }

        return Response(response, status=status_code)
