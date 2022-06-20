from django.utils.timezone import now, timedelta

from core.app.models import Task


DAYS_COUNT_FROM_TODAY = 16


class Statistics:

    def __init__(self, owner):
        self._today = now().date()
        start_day = (now() - timedelta(days=DAYS_COUNT_FROM_TODAY)).date()
        end_day = (now() + timedelta(days=DAYS_COUNT_FROM_TODAY)).date()
        self._tasks = Task.objects.filter(owner=owner, date__range=[start_day, end_day]).order_by('date')
        self._tired_days = []
        self.calculate_tired_days()

    @property
    def tasks(self):
        return self._tasks

    @property
    def tired_days(self):
        return self._tired_days

    def get_active_tasks(self):
        return self.tasks.filter(date__gte=self._today, done=False)

    def get_done_tasks(self):
        return self.tasks.filter(done=True)

    def get_missed_tasks(self):
        return self.tasks.filter(date__lt=self._today, done=False)

    def get_free_days(self):
        return DAYS_COUNT_FROM_TODAY - self.get_active_tasks().distinct('date').count()

    def get_busy_days(self):
        return DAYS_COUNT_FROM_TODAY - self.get_free_days()

    def calculate_tired_days(self):
        current_index = 0
        active_tasks = self.get_active_tasks()

        for value in range(DAYS_COUNT_FROM_TODAY + 1):
            date = (now() + timedelta(days=value)).date()
            active_tasks_by_date = active_tasks.filter(date=date)

            if active_tasks_by_date.exists():
                if current_index == len(self._tired_days):
                    self._tired_days.append([])
                for active_task_by_date in active_tasks_by_date:
                    self._tired_days[current_index].append(active_task_by_date.date)
            else:
                current_index += current_index != len(self._tired_days)

    @property
    def is_get_tired(self):
        return any((len(days) > 2 for days in self._tired_days))

    def get_tired_days_range(self):
        if not self.is_get_tired:
            return None

        return [(days[0], days[-1]) for days in self._tired_days if len(days) > 2]

    def get_data(self):
        data = {
            'active_tasks': self.get_active_tasks().values(),
            'active': self.get_active_tasks().count(),
            'done': self.get_done_tasks().count(),
            'missed': self.get_missed_tasks().count(),
            'free_days': self.get_free_days(),
            'busy_days': self.get_busy_days(),
            'fatigue': {
                'is_get_tired': self.is_get_tired,
                'tired_days_range': self.get_tired_days_range()
            }
        }

        return data
