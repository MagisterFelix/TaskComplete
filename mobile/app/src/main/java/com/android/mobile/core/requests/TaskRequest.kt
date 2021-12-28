package com.android.mobile.core.requests

import com.google.gson.annotations.SerializedName

data class TaskRequest(
    @SerializedName("date")
    var date: String,

    @SerializedName("title")
    var title: String,

    @SerializedName("description")
    var description: String,

    @SerializedName("priority")
    var priority: Int,

    @SerializedName("done")
    var done: Boolean
)