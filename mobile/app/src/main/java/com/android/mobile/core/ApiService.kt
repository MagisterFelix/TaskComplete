package com.android.mobile.core

import com.android.mobile.core.responses.LoginResponse
import com.android.mobile.core.requests.LoginRequest
import com.android.mobile.core.requests.RegisterRequest
import com.android.mobile.core.responses.ProfileResponse
import com.android.mobile.core.responses.RegisterResponse
import retrofit2.Call
import retrofit2.http.*

interface ApiService {

    @POST(Constants.REGISTER_URL)
    fun register(@Body request: RegisterRequest): Call<RegisterResponse>

    @POST(Constants.LOGIN_URL)
    fun login(@Body request: LoginRequest): Call<LoginResponse>

    @GET(Constants.PROFILE_URL)
    fun profile(@Header("Authorization") token: String): Call<ProfileResponse>

}