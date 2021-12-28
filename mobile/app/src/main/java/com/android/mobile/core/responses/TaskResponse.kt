package com.android.mobile.core.responses

import com.google.gson.annotations.SerializedName

data class TaskResponse(
    @SerializedName("status_code")
    var statusCode: Int,

    @SerializedName("message")
    var message: String
)
