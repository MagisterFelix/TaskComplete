package com.android.mobile.core.models

import com.google.gson.annotations.SerializedName
import java.util.*

data class Task(
    @SerializedName("id")
    var id: Int,

    @SerializedName("date")
    var date: Date,

    @SerializedName("title")
    var title: String,

    @SerializedName("description")
    var description: String,

    @SerializedName("priority")
    var priority: Int,

    @SerializedName("done")
    var done: Boolean
)
