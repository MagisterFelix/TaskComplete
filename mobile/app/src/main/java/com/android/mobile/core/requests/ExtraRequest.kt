package com.android.mobile.core.requests

import com.google.gson.annotations.SerializedName

data class ExtraRequest(
    @SerializedName("information")
    var information: String
)
