package com.android.mobile.core.responses

import com.android.mobile.core.models.Task
import com.google.gson.annotations.SerializedName

data class TasksResponse(
    @SerializedName("status_code")
    var statusCode: Int,

    @SerializedName("message")
    var message: String,

    @SerializedName("data")
    var tasks: MutableList<Task>
)
