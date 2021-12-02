from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_jwt.authentication import JSONWebTokenAuthentication

from core.app.models import Task, User
from core.app.serializers import TaskSerializer


class TaskView(APIView):
    serializer_class = TaskSerializer
    permission_classes = (IsAuthenticated,)
    authentication_class = JSONWebTokenAuthentication

    def get(self, request, primary_key=None):
        if primary_key is None:
            data = Task.objects.all().values()
            success = True
            status_code = status.HTTP_200_OK
            message = 'Tasks received successfully.'
        else:
            task = Task.objects.filter(id=primary_key)

            if task.exists():
                data = task.values().first()
                success = True
                status_code = status.HTTP_200_OK
                message = 'Task received successfully.'
            else:
                data = None
                success = False
                status_code = status.HTTP_404_NOT_FOUND
                message = 'Task does not exist.'

        response = {
            'success': success,
            'status code': status_code,
            'message': message,
            'data': data
        }

        return Response(response, status=status_code)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            serializer.save(owner=request.user)
            success = True
            status_code = status.HTTP_201_CREATED
            message = 'Task created successfully.'
        else:
            success = False
            message = serializer.errors
            status_code = status.HTTP_400_BAD_REQUEST

        response = {
            'success': success,
            'status code': status_code,
            'message': message
        }

        return Response(response, status=status_code)

    def put(self, request, primary_key=None):
        if primary_key is None:
            success = False
            status_code = status.HTTP_400_BAD_REQUEST
            message = 'Task id is required.'
        else:
            task = Task.objects.filter(id=primary_key)

            if task.exists():
                serializer = self.serializer_class(task.first(), data=request.data)

                if serializer.is_valid():
                    if serializer.validated_data.get('done'):
                        task.delete()
                        success = True
                        status_code = status.HTTP_200_OK
                        message = 'Task completed successfully.'
                    else:
                        serializer.save(owner=request.user)
                        success = True
                        status_code = status.HTTP_200_OK
                        message = 'Task updated successfully.'
                else:
                    success = False
                    message = serializer.errors
                    status_code = status.HTTP_400_BAD_REQUEST
            else:
                success = False
                status_code = status.HTTP_404_NOT_FOUND
                message = 'Task does not exist.'

        response = {
            'success': success,
            'status code': status_code,
            'message': message
        }

        return Response(response, status=status_code)

    def delete(self, request, primary_key=None):
        if primary_key is None:
            success = False
            status_code = status.HTTP_400_BAD_REQUEST
            message = 'Task id is required.'
        else:
            task = Task.objects.filter(id=primary_key)

            if task.exists():
                task.first().delete()
                success = True
                status_code = status.HTTP_200_OK
                message = 'Task deleted successfully.'
            else:
                success = False
                status_code = status.HTTP_404_NOT_FOUND
                message = 'Task does not exist.'

        response = {
            'success': success,
            'status code': status_code,
            'message': message
        }

        return Response(response, status=status_code)
