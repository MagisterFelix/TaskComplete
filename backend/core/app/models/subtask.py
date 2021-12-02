from django.db import models

from .task import Task


class Subtask(models.Model):

    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    title = models.CharField(max_length=64)
    done = models.BooleanField(default=False)

    class Meta:
        db_table = 'subtask'
        unique_together = (('task', 'title',))

    def __str__(self):
        return self.title
