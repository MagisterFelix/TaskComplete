import json
import config
import requests
from auth import Authorization


class View:

    def __init__(self):
        self.auth = Authorization()
        self.auth.log_in()

    def get_tasks(self):
        response = requests.get(
            config.tasks,
            headers={'Authorization': f'Bearer {self.auth.token}'}
        )

        if response.status_code == 401:
            self.auth.log_in()
            self.get_tasks()

        if response.status_code == 200:
            return response.json()['data']

        return []

    def update_task(self, task_id, done):
        response = requests.put(
            config.task.replace('task_id', str(task_id)),
            headers={
                'Authorization': f'Bearer {self.auth.token}',
                'Accept': '*/*',
                'Content-Type': 'application/json'
            },
            data=json.dumps({'done': done})
        )

        if response.status_code == 401:
            self.auth.log_in()
            self.complete_task()
