package com.android.mobile.core.models

import com.google.gson.annotations.SerializedName

data class User (
    @SerializedName("id")
    var id: Int,

    @SerializedName("email")
    var email: String,

    @SerializedName("username")
    var username: String
)
