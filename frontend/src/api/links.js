const host = "https://127.0.0.1:8000";

const API = {
    profile: host + "/profile",
    register: host + "/signUp",
    login: host + "/signIn",
    tasks: host + "/tasks",
    task: host + "/tasks/id=task_id",
    subtasks: host + "/subtasks/task=task_id",
    subtask: host + "/subtasks/task=task_id/id=subtask_id",
    tags: host + "/tags/task=task_id",
    tag: host + "/tags/task=task_id/id=tag_id",
    extras: host + "/extra/task=task_id",
    extra: host + "/extra/task=task_id/id=tag_id",
    statistics: host + "/statistics",
    admin: host + "/administrator"
}

export default API;
