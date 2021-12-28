package com.android.mobile.core.responses

import com.android.mobile.core.models.Extra
import com.google.gson.annotations.SerializedName

data class ExtrasResponse(
    @SerializedName("status_code")
    var statusCode: Int,

    @SerializedName("message")
    var message: String,

    @SerializedName("data")
    var extras: MutableList<Extra>
)
