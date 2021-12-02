from django.db import models

from .task import Task


class Tag(models.Model):

    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    title = models.CharField(max_length=64)

    class Meta:
        db_table = 'tag'
        unique_together = (('task', 'title',))

    def __str__(self):
        return self.title
