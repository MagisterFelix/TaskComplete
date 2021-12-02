from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin

class UserManager(BaseUserManager):

    def create_user(self, email, password, name=None, time_zone=None):
        if email is None:
            raise ValueError('Users must have an email.')

        if name is None:
            name = email[:email.find('@')].capitalize()

        if time_zone is None:
            time_zone = 'UTC'

        user = self.model(
            email=self.normalize_email(email),
            name=name,
            time_zone=time_zone
        )
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password):
        if password is None:
            raise TypeError('Superusers must have a password.')

        user = self.create_user(email, password)
        user.is_superuser = True
        user.is_staff = True
        user.save()

        return user


class User(AbstractBaseUser, PermissionsMixin):

    email = models.EmailField(
        verbose_name='email',
        max_length=40,
        unique=True
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    name = models.CharField(max_length=64, blank=True)
    premium = models.CharField(max_length=256, blank=True)
    image = models.CharField(max_length=128, default='https://i.imgur.com/V4RclNb.png', blank=True)
    time_zone = models.CharField(max_length=32, default='UTC')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        db_table = 'auth_user'

    def __str__(self):
        return self.email
