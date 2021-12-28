package com.android.mobile.core.requests

import com.google.gson.annotations.SerializedName

data class SubtaskRequest(
    @SerializedName("title")
    var title: String,

    @SerializedName("done")
    var done: Boolean
)
