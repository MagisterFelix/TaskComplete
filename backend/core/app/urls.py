from django.conf.urls import url

from core.app.views.user_view import UserRegistrationView, UserLoginView, UserProfileView
from core.app.views.task_view import TaskView

urlpatterns = [
    url(r'^signUp/?$', UserRegistrationView.as_view()),
    url(r'^signIn/?$', UserLoginView.as_view()),
    url(r'^profile/?$', UserProfileView.as_view()),
    url(r'^tasks/?$', TaskView.as_view()),
    url(r'^tasks/id=(?P<primary_key>\d+)/?$', TaskView.as_view()),
]
