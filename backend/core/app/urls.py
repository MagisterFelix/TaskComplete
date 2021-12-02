from django.conf.urls import url

from core.app.views.user_view import UserRegistrationView, UserLoginView, UserProfileView
from core.app.views.task_view import TaskView
from core.app.views.subtask_view import SubtaskView
from core.app.views.tag_view import TagView
from core.app.views.extra_view import ExtraView

urlpatterns = [
    url(r'^signUp/?$', UserRegistrationView.as_view()),
    url(r'^signIn/?$', UserLoginView.as_view()),
    url(r'^profile/?$', UserProfileView.as_view()),
    url(r'^tasks/?$', TaskView.as_view()),
    url(r'^tasks/id=(?P<primary_key>\d+)/?$', TaskView.as_view()),
    url(r'^subtasks/task=(?P<task_primary_key>\d+)/?$', SubtaskView().as_view()),
    url(r'^subtasks/task=(?P<task_primary_key>\d+)/id=(?P<primary_key>\d+)/?$', SubtaskView().as_view()),
    url(r'^tags/task=(?P<task_primary_key>\d+)/?$', TagView().as_view()),
    url(r'^tags/task=(?P<task_primary_key>\d+)/id=(?P<primary_key>\d+)/?$', TagView().as_view()),
    url(r'^extra/task=(?P<task_primary_key>\d+)/?$', ExtraView().as_view()),
    url(r'^extra/task=(?P<task_primary_key>\d+)/id=(?P<primary_key>\d+)/?$', ExtraView().as_view()),
]
