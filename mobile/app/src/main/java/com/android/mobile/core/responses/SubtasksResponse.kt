package com.android.mobile.core.responses

import com.android.mobile.core.models.Subtask
import com.google.gson.annotations.SerializedName

data class SubtasksResponse(
    @SerializedName("status_code")
    var statusCode: Int,

    @SerializedName("message")
    var message: String,

    @SerializedName("data")
    var subtasks: MutableList<Subtask>
)
