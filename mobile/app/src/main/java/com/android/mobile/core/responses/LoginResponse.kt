package com.android.mobile.core.responses

import com.google.gson.annotations.SerializedName

data class LoginResponse (
    @SerializedName("status_code")
    var statusCode: Int,

    @SerializedName("message")
    var message: String,

    @SerializedName("token")
    var token: String
)
