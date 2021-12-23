package com.android.mobile.core.responses

import com.android.mobile.core.models.User
import com.google.gson.annotations.SerializedName

data class ProfileResponse(
    @SerializedName("status_code")
    var statusCode: Int,

    @SerializedName("message")
    var message: String,

    @SerializedName("user")
    var user: User
)
