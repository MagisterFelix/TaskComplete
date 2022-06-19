from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_jwt.authentication import JSONWebTokenAuthentication

from core.app.models import Subtask, Task
from core.app.serializers import SubtaskSerializer


class SubtaskView(APIView):
    serializer_class = SubtaskSerializer
    permission_classes = (IsAuthenticated,)
    authentication_class = JSONWebTokenAuthentication

    def get(self, request, task_primary_key, primary_key=None):
        task = Task.objects.filter(owner=request.user.id, id=task_primary_key)

        if task.exists():
            subtasks = Subtask.objects.filter(task=task_primary_key).order_by('done')

            if primary_key is None:
                data = subtasks.values()
                success = True
                status_code = status.HTTP_200_OK
                message = 'Subtasks received successfully.'
            else:
                subtask = subtasks.filter(id=primary_key)

                if subtask.exists():
                    data = subtask.values().first()
                    success = True
                    status_code = status.HTTP_200_OK
                    message = 'Subtask received successfully.'
                else:
                    data = None
                    success = False
                    status_code = status.HTTP_404_NOT_FOUND
                    message = 'Subtask does not exist.'
        else:
            data = None
            success = False
            message = 'User is not assigned to this task.'
            status_code = status.HTTP_403_FORBIDDEN

        response = {
            'success': success,
            'status_code': status_code,
            'message': message,
            'data': data
        }

        return Response(response, status=status_code)

    def post(self, request, task_primary_key):
        task = Task.objects.filter(owner=request.user.id, id=task_primary_key)

        if task.exists():
            request.data['task'] = task_primary_key
            serializer = self.serializer_class(data=request.data)

            if serializer.is_valid():
                serializer.save()
                success = True
                status_code = status.HTTP_201_CREATED
                message = 'Subtask created successfully.'
            else:
                success = False
                message = ''
                for value in serializer.errors.values():
                    message += value[0][:-1].capitalize() + '.'
                status_code = status.HTTP_400_BAD_REQUEST
        else:
            data = None
            success = False
            message = 'User is not assigned to this task.'
            status_code = status.HTTP_403_FORBIDDEN

        response = {
            'success': success,
            'status_code': status_code,
            'message': message
        }

        return Response(response, status=status_code)

    def put(self, request, task_primary_key, primary_key=None):
        task = Task.objects.filter(owner=request.user.id, id=task_primary_key)

        if task.exists():
            if primary_key is None:
                success = False
                status_code = status.HTTP_400_BAD_REQUEST
                message = 'Subtask id is required.'
            else:
                subtask = Subtask.objects.filter(id=primary_key)

                if subtask.exists():
                    request.data['task'] = task_primary_key
                    serializer = self.serializer_class(subtask.first(), data=request.data)

                    if serializer.is_valid():
                        serializer.save()
                        success = True
                        status_code = status.HTTP_200_OK
                        message = 'Subtask updated successfully.'
                    else:
                        success = False
                        message = ''
                        for value in serializer.errors.values():
                            message += value[0][:-1].capitalize() + '.'
                        status_code = status.HTTP_400_BAD_REQUEST
                else:
                    success = False
                    status_code = status.HTTP_404_NOT_FOUND
                    message = 'Subtask does not exist.'
        else:
            data = None
            success = False
            message = 'User is not assigned to this task.'
            status_code = status.HTTP_403_FORBIDDEN

        response = {
            'success': success,
            'status_code': status_code,
            'message': message
        }

        return Response(response, status=status_code)

    def delete(self, request, task_primary_key, primary_key=None):
        task = Task.objects.filter(owner=request.user.id, id=task_primary_key)

        if task.exists():
            if primary_key is None:
                success = False
                status_code = status.HTTP_400_BAD_REQUEST
                message = 'Subtask id is required.'
            else:
                subtask = Subtask.objects.filter(task=task_primary_key, id=primary_key)

                if subtask.exists():
                    subtask.first().delete()
                    success = True
                    status_code = status.HTTP_200_OK
                    message = 'Subtask deleted successfully.'
                else:
                    success = False
                    status_code = status.HTTP_404_NOT_FOUND
                    message = 'Subtask does not exist.'
        else:
            data = None
            success = False
            message = 'User is not assigned to this task.'
            status_code = status.HTTP_403_FORBIDDEN

        response = {
            'success': success,
            'status_code': status_code,
            'message': message
        }

        return Response(response, status=status_code)
