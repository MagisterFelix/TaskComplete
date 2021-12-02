from django.db import models

from .task import Task


class Extra(models.Model):

    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    information = models.CharField(max_length=256)

    class Meta:
        db_table = 'extra'

    def __str__(self):
        return self.task
