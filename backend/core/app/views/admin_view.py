from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_jwt.authentication import JSONWebTokenAuthentication

from core.app.serializers import ProfileSerializer, TaskSerializer, SubtaskSerializer, TagSerializer, ExtraSerializer
from core.app.models import User, Task, Subtask, Tag, Extra


class AdminView(APIView):
    serializer_classes = {
        'user': ProfileSerializer,
        'task': TaskSerializer,
        'subtask': SubtaskSerializer,
        'tag': TagSerializer,
        'extra': ExtraSerializer
    }
    permission_classes = (IsAuthenticated, IsAdminUser)
    authentication_class = JSONWebTokenAuthentication

    def get(self, request):
        users = User.objects.all().values()
        tasks = Task.objects.all().values()
        subtasks = Subtask.objects.all().values()
        tags = Tag.objects.all().values()
        extras = Extra.objects.all().values()

        success = True
        status_code = status.HTTP_200_OK
        message = 'Info received successfully.'
        data = {
            'users': users,
            'tasks': tasks,
            'subtasks': subtasks,
            'tags': tags,
            'extras': extras
        }

        response = {
            'success': success,
            'status_code': status_code,
            'message': message,
            'data': data
        }

        return Response(response, status=status_code)

    def post(self, request):
        serializer = self.serializer_classes[request.data['model']](data=request.data)

        if serializer.is_valid():
            serializer.save()
            success = True
            status_code = status.HTTP_201_CREATED
            message = 'Info created successfully.'
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

    def put(self, request):
        serializer = self.serializer_classes[request.data['model']](data=request.data)

        if serializer.is_valid():
            serializer.save()
            success = True
            status_code = status.HTTP_200_OK
            message = 'Info updated successfully.'
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

    def delete(self, request):
        if request.data['model'] == 'user':
            model = User.objects.filter(id=request.data['id'])
        if request.data['model'] == 'task':
            model = Task.objects.filter(id=request.data['id'])
        if request.data['model'] == 'subtask':
            model = Subtask.objects.filter(id=request.data['id'])
        if request.data['model'] == 'tag':
            model = Tag.objects.filter(id=request.data['id'])
        if request.data['model'] == 'extra':
            model = Extra.objects.filter(id=request.data['id'])

        if model.exists():
            model.first().delete()
            success = True
            status_code = status.HTTP_200_OK
            message = 'Info deleted successfully.'
        else:
            success = False
            status_code = status.HTTP_404_NOT_FOUND
            message = 'Info does not exist.'

        response = {
            'success': success,
            'status_code': status_code,
            'message': message
        }

        return Response(response, status=status_code)
