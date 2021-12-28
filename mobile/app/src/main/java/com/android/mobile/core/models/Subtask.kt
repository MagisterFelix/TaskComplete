package com.android.mobile.core.models

import com.google.gson.annotations.SerializedName

data class Subtask(
    @SerializedName("id")
    var id: Int,

    @SerializedName("title")
    var title: String,

    @SerializedName("done")
    var done: Boolean
)
