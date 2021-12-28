package com.android.mobile.core

import com.android.mobile.core.requests.*
import com.android.mobile.core.responses.*
import retrofit2.Call
import retrofit2.http.*

interface ApiService {

    @POST(Constants.REGISTER_URL)
    fun register(@Body request: RegisterRequest): Call<RegisterResponse>

    @POST(Constants.LOGIN_URL)
    fun login(@Body request: LoginRequest): Call<LoginResponse>

    @GET(Constants.PROFILE_URL)
    fun profile(@Header("Authorization") token: String): Call<ProfileResponse>

    @GET(Constants.TASKS_URL)
    fun tasks(@Header("Authorization") token: String): Call<TasksResponse>

    @POST(Constants.TASKS_URL)
    fun postTask(@Header("Authorization") token: String, @Body request: TaskRequest): Call<TaskResponse>

    @PUT(Constants.TASK_URL)
    fun putTask(@Header("Authorization") token: String, @Path("task_id") task_id: Int, @Body request: TaskRequest): Call<TaskResponse>

    @DELETE(Constants.TASK_URL)
    fun deleteTask(@Header("Authorization") token: String, @Path("task_id") task_id: Int): Call<TaskResponse>

    @GET(Constants.SUBTASKS_URL)
    fun subtasks(@Header("Authorization") token: String, @Path("task_id") task_id: Int): Call<SubtasksResponse>

    @POST(Constants.SUBTASKS_URL)
    fun postSubtask(@Header("Authorization") token: String, @Path("task_id") task_id: Int,  @Body request: SubtaskRequest): Call<SubtaskResponse>

    @PUT(Constants.SUBTASK_URL)
    fun putSubtask(@Header("Authorization") token: String, @Path("task_id") task_id: Int, @Path("subtask_id") subtask_id: Int, @Body request: SubtaskRequest): Call<SubtaskResponse>

    @DELETE(Constants.SUBTASK_URL)
    fun deleteSubtask(@Header("Authorization") token: String, @Path("task_id") task_id: Int, @Path("subtask_id") subtask_id: Int): Call<SubtaskResponse>

    @GET(Constants.EXTRAS_URL)
    fun extras(@Header("Authorization") token: String, @Path("task_id") task_id: Int): Call<ExtrasResponse>

    @POST(Constants.EXTRAS_URL)
    fun postExtra(@Header("Authorization") token: String, @Path("task_id") task_id: Int,  @Body request: ExtraRequest): Call<ExtraResponse>
}