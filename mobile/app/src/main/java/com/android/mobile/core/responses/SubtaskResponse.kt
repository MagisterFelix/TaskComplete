package com.android.mobile.core.responses

import com.google.gson.annotations.SerializedName

data class SubtaskResponse(
    @SerializedName("status_code")
    var statusCode: Int,

    @SerializedName("message")
    var message: String
)
