package com.android.mobile.core.models

import com.google.gson.annotations.SerializedName

data class Extra(
    @SerializedName("id")
    var id: Int,

    @SerializedName("information")
    var information: String
)
