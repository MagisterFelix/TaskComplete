from pathlib import Path

from django.db.models import OuterRef, Subquery
from django.http import HttpResponse
from wsgiref.util import FileWrapper

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_jwt.authentication import JSONWebTokenAuthentication

from core.settings import DBBACKUP_STORAGE_OPTIONS

from core.management import backup, restore
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
        if request.headers.get('command') is None:
            users = User.objects.all().order_by('id').values()
            tasks = Task.objects.all().annotate(
                owner_name=Subquery(
                    User.objects.filter(
                        id=OuterRef('owner_id')
                    ).values('email')
                )).order_by('owner', 'date').values()
            subtasks = Subtask.objects.all().annotate(
                task_title=Subquery(
                    Task.objects.filter(
                        id=OuterRef('task_id')
                    ).values('title')
                )).order_by('task', 'title').values()
            tags = Tag.objects.all().annotate(
                task_title=Subquery(
                    Task.objects.filter(
                        id=OuterRef('task_id')
                    ).values('title')
                )).order_by('task', 'title').values()
            extras = Extra.objects.all().annotate(
                task_title=Subquery(
                    Task.objects.filter(
                        id=OuterRef('task_id')
                    ).values('title')
                )).order_by('task', 'information').values()

            success = True
            status_code = status.HTTP_200_OK
            message = 'Info received successfully.'
            data = {
                'User': users,
                'Task': tasks,
                'Subtask': subtasks,
                'Tag': tags,
                'Extra': extras
            }

            response = {
                'success': success,
                'status_code': status_code,
                'message': message,
                'data': data
            }

            return Response(response, status=status_code)

        if request.headers.get('command') == 'backup':
            function_response = backup()

            if function_response is None:
                success = True
                status_code = status.HTTP_200_OK
                message = 'System backed up successfully.'

                backup_directory = f'{DBBACKUP_STORAGE_OPTIONS["location"]}'
                file_path = max(Path(backup_directory).glob('*'), key=lambda x: x.stat().st_ctime)
                file_name = file_path.as_posix().split('/')[-1]

                with open(file_path, 'rb') as file:
                    response = HttpResponse(FileWrapper(file), content_type='application/psql', status=status_code)
                    response["Access-Control-Expose-Headers"] = "Content-Disposition"
                    response['Content-Disposition'] = f'attachment; filename="{file_name}"'

                return response
            else:
                success = False
                status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
                message = function_response

                return Response(response, status=status_code)
        else:
            command, file_name = request.headers['command'].split('/')

            if command == 'restore':
                function_response = restore(file_name)

                if function_response is None:
                    success = True
                    status_code = status.HTTP_200_OK
                    message = 'System restored successfully.'
                else:
                    success = False
                    status_code = status.HTTP_404_NOT_FOUND
                    message = 'No file with this name was found.'

                response = {
                    'success': success,
                    'status_code': status_code,
                    'message': message
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
            print(serializer.errors)
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

        serializer = self.serializer_classes[request.data['model']](model.first(), data=request.data)

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
