from django.db import models
from django.core.validators import ValidationError
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin

from datetime import datetime


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


class Task(models.Model):

    class Priority(models.IntegerChoices):
        DEFAULT = 0, 'No priority'
        HIGH = 1, 'High priority'
        MEDIUM = 2, 'Medium priority'
        LOW = 3, 'Low priority'

    class Reminder(models.IntegerChoices):
        DEFAULT = 0, 'No reminder'
        THREE_DAYS = 1, 'Warn three days before the end'
        ONE_DAY = 2, 'Warn one day before the end'
        THREE_HOURS = 3, 'Warn three hours before the end'
        ONE_HOUR = 4, 'Warn one hour before the end'

    def validate_date(date):
        if date <= datetime.today().date():
            raise ValidationError('Date must be at least tomorrow', code='invalid')

    date = models.DateField(validators=[validate_date])
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=64)
    description = models.CharField(max_length=512, blank=True)
    priority = models.IntegerField(choices=Priority.choices, default=Priority.DEFAULT)
    reminder = models.IntegerField(choices=Reminder.choices, default=Reminder.DEFAULT)
    done = models.BooleanField(default=False)

    class Meta:
        db_table = 'task'
        unique_together = (('owner', 'title',))

    def __str__(self):
        return self.title


class Subtask(models.Model):

    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    title = models.CharField(max_length=64)
    done = models.BooleanField(default=False)

    class Meta:
        db_table = 'subtask'
        unique_together = (('task', 'title',))

    def __str__(self):
        return self.title


class Tag(models.Model):

    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    title = models.CharField(max_length=64)

    class Meta:
        db_table = 'tag'
        unique_together = (('task', 'title',))

    def __str__(self):
        return self.title


class Extra(models.Model):

    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    information = models.CharField(max_length=256)

    class Meta:
        db_table = 'extra'

    def __str__(self):
        return self.task
