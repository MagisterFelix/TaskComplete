from django.db import models
from django.core.validators import ValidationError

from .user import User
from datetime import datetime


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
