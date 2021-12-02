from django.conf.urls import url

from core.app.views.user_view import UserRegistrationView, UserLoginView, UserProfileView

urlpatterns = [
    url(r'^signUp/?$', UserRegistrationView.as_view()),
    url(r'^signIn/?$', UserLoginView.as_view()),
    url(r'^profile/?$', UserProfileView.as_view()),
]
