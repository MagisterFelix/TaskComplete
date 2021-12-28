package com.android.mobile.core

object Constants {
    const val BASE_URL = "http://10.0.2.2:8000"
    const val REGISTER_URL = "/signUp"
    const val LOGIN_URL = "/signIn"
    const val PROFILE_URL = "/profile"
    const val TASKS_URL = "/tasks"
    const val TASK_URL = "/tasks/id={task_id}"
    const val SUBTASKS_URL = "/subtasks/task={task_id}"
    const val SUBTASK_URL = "/subtasks/task={task_id}/id={subtask_id}"
    const val EXTRAS_URL = "/extra/task={task_id}"
}