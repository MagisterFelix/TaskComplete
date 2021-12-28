package com.android.mobile.views

import android.annotation.SuppressLint
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.MenuItem
import android.view.View
import android.widget.EditText
import android.widget.Toast
import androidx.core.app.NavUtils
import com.android.mobile.R
import com.android.mobile.core.ApiClient
import com.android.mobile.core.SessionManager
import com.android.mobile.core.requests.SubtaskRequest
import com.android.mobile.core.responses.SubtaskResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class SubtaskActivity : AppCompatActivity() {
    private lateinit var apiClient: ApiClient
    private lateinit var sessionManager: SessionManager

    companion object {
        const val TASK_ID = "Task"
        const val ID = "Id"
        const val TITLE = "Title"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_subtask)

        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        apiClient = ApiClient()
        sessionManager = SessionManager(this)

        findViewById<EditText>(R.id.subtaskFormTitle).setText(intent.getStringExtra("Title"))
    }

    fun toMain() {
        startActivity(Intent(this, MainActivity::class.java))
    }

    @SuppressLint("CutPasteId")
    fun updateTask(view: View) {
        val title = findViewById<EditText>(R.id.subtaskFormTitle).text.toString()

        apiClient.getApiService().putSubtask(
            token = "Bearer ${sessionManager.fetchToken()}",
            task_id = intent.getIntExtra("Task", 0),
            subtask_id = intent.getIntExtra("Id", 0),
            SubtaskRequest(
                title = title,
                done = false
            )
        )
            .enqueue(object : Callback<SubtaskResponse> {
                override fun onFailure(call: Call<SubtaskResponse>, t: Throwable) {
                    Toast.makeText(applicationContext, t.localizedMessage, Toast.LENGTH_SHORT)
                        .show()
                }

                override fun onResponse(
                    call: Call<SubtaskResponse>,
                    response: Response<SubtaskResponse>
                ) {
                    val subtaskResponse = response.body()

                    if (subtaskResponse?.statusCode == 200) {
                        Toast.makeText(
                            applicationContext,
                            subtaskResponse.message,
                            Toast.LENGTH_SHORT
                        ).show()
                        toMain()
                    } else {
                        Toast.makeText(
                            applicationContext,
                            "Subtask with this title already exists.",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            })
    }

    fun deleteTask(view: View) {
        apiClient.getApiService().deleteSubtask(
            token = "Bearer ${sessionManager.fetchToken()}",
            task_id = intent.getIntExtra("Task", 0),
            subtask_id = intent.getIntExtra("Id", 0)
        )
            .enqueue(object : Callback<SubtaskResponse> {
                override fun onFailure(call: Call<SubtaskResponse>, t: Throwable) {
                    Toast.makeText(applicationContext, t.localizedMessage, Toast.LENGTH_SHORT)
                        .show()
                }

                override fun onResponse(
                    call: Call<SubtaskResponse>,
                    response: Response<SubtaskResponse>
                ) {
                    val subtaskResponse = response.body()

                    if (subtaskResponse?.statusCode == 200) {
                        Toast.makeText(
                            applicationContext,
                            subtaskResponse.message,
                            Toast.LENGTH_SHORT
                        ).show()
                        toMain()
                    }
                }
            })
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            android.R.id.home -> {
                NavUtils.navigateUpFromSameTask(this)
                return true
            }
        }
        return super.onOptionsItemSelected(item)
    }
}