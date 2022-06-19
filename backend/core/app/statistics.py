from django.utils.timezone import now, timedelta

from core.app.models import Task


DAYS_COUNT_FROM_TODAY = 15


class Statistics:

    def __init__(self, owner):
        self._today = now().date()
        start_day = (now() - timedelta(days=DAYS_COUNT_FROM_TODAY)).date()
        end_day = (now() + timedelta(days=DAYS_COUNT_FROM_TODAY)).date()
        self._tasks = Task.objects.filter(owner=owner, date__range=[start_day, end_day]).order_by('date')
        self._consecutive_days = []
        self.calculate_tired_days()

    @property
    def tasks(self):
        return self._tasks

    @property
    def consecutive_days(self):
        return self._consecutive_days

    def get_active_tasks(self):
        return self.tasks.filter(date__gte=self._today, done=False)

    def get_done_tasks(self):
        return self.tasks.filter(done=True)

    def get_missed_tasks(self):
        return self.tasks.filter(date__lt=self._today, done=False)

    def get_free_days(self):
        return DAYS_COUNT_FROM_TODAY - self.get_active_tasks().count()

    def get_busy_days(self):
        return DAYS_COUNT_FROM_TODAY - self.get_free_days()

    def calculate_tired_days(self):
        current_index = 0
        active_tasks = self.get_active_tasks()

        for value in range(DAYS_COUNT_FROM_TODAY + 1):
            date = (now() + timedelta(days=value)).date()
            active_task = active_tasks.filter(date=date)

            if active_task.exists():
                if current_index == len(self.consecutive_days):
                    self.consecutive_days.append([])
                self.consecutive_days[current_index].append(active_task.first().date)
            else:
                current_index += current_index != len(self.consecutive_days)

    @property
    def is_get_tired(self):
        return any((len(days) > 2 for days in self.consecutive_days))

    def get_tired_days_range(self):
        if not self.is_get_tired:
            return None

        return [(days[0], days[-1]) for days in self.consecutive_days if len(days) > 2]

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
            },
            'consecutive_days': self.consecutive_days
        }

        return data
