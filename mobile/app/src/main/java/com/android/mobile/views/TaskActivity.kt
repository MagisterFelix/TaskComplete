package com.android.mobile.views

import android.annotation.SuppressLint
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.MenuItem
import android.view.ViewGroup
import android.widget.*
import com.android.mobile.R
import androidx.core.app.NavUtils
import androidx.core.content.ContextCompat
import com.android.mobile.core.ApiClient
import com.android.mobile.core.SessionManager
import com.android.mobile.core.requests.TaskRequest
import com.android.mobile.core.responses.TaskResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.text.SimpleDateFormat
import java.util.*

class TaskActivity : AppCompatActivity() {
    private lateinit var apiClient: ApiClient
    private lateinit var sessionManager: SessionManager

    companion object {
        const val UPDATE = "Update"
        const val ID = "Id"
        const val DATE = "Date"
        const val TITLE = "Title"
        const val DESCRIPTION = "Description"
        const val PRIORITY = "Priority"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_task)

        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        val spinner: Spinner = findViewById(R.id.taskFormPriority)
        ArrayAdapter.createFromResource(
            this,
            R.array.priority_array,
            android.R.layout.simple_spinner_item
        ).also { adapter ->
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
            spinner.adapter = adapter
        }
        spinner.setSelection(intent.getIntExtra("Priority", 0))

        buttons()

        val calendar = Calendar.getInstance()
        calendar.add(Calendar.DAY_OF_MONTH, 1)
        findViewById<DatePicker>(R.id.taskFormDate).minDate = calendar.time.time
        calendar.time = Date(intent.getLongExtra("Date", calendar.time.time))
        findViewById<DatePicker>(R.id.taskFormDate).updateDate(calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH))
        findViewById<EditText>(R.id.taskFormTitle).setText(intent.getStringExtra("Title"))
        findViewById<EditText>(R.id.taskFormDescription).setText(if (intent.getStringExtra("Description") == "No description") "" else intent.getStringExtra("Description"))

        apiClient = ApiClient()
        sessionManager = SessionManager(this)
    }

    private fun dp(value: Float): Float {
        return value * this.resources.displayMetrics.density
    }

    fun toMain() {
        startActivity(Intent(this, MainActivity::class.java))
    }

    @SuppressLint("SimpleDateFormat", "CutPasteId")
    private fun createOrUpdateTask() {
        val day = findViewById<DatePicker>(R.id.taskFormDate).dayOfMonth
        val month = findViewById<DatePicker>(R.id.taskFormDate).month
        val year = findViewById<DatePicker>(R.id.taskFormDate).year
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.YEAR, year)
        calendar.set(Calendar.MONTH, month)
        calendar.set(Calendar.DAY_OF_MONTH, day)
        val date = SimpleDateFormat("yyyy-MM-dd").format(calendar.time).toString()
        val title = findViewById<EditText>(R.id.taskFormTitle).text.toString()
        val description = findViewById<EditText>(R.id.taskFormDescription).text.toString()
        val priority = findViewById<Spinner>(R.id.taskFormPriority).selectedItemPosition

        if (!intent.getBooleanExtra("Update", false)) {
            apiClient.getApiService().postTask(
                token = "Bearer ${sessionManager.fetchToken()}",
                TaskRequest(
                    date = date,
                    title = title,
                    description = description,
                    priority = priority,
                    done = false
                )
            )
                .enqueue(object : Callback<TaskResponse> {
                    override fun onFailure(call: Call<TaskResponse>, t: Throwable) {
                        Toast.makeText(applicationContext, t.localizedMessage, Toast.LENGTH_SHORT)
                            .show()
                    }

                    override fun onResponse(
                        call: Call<TaskResponse>,
                        response: Response<TaskResponse>
                    ) {
                        val taskResponse = response.body()

                        if (taskResponse?.statusCode == 201) {
                            Toast.makeText(
                                applicationContext,
                                taskResponse.message,
                                Toast.LENGTH_SHORT
                            ).show()
                            toMain()
                        } else {
                            Toast.makeText(
                                applicationContext,
                                "Task with this title already exists.",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    }
                })
        } else {
            apiClient.getApiService().putTask(
                token = "Bearer ${sessionManager.fetchToken()}",
                task_id = intent.getIntExtra("Id", 0),
                TaskRequest(
                    date = date,
                    title = title,
                    description = description,
                    priority = priority,
                    done = false
                )
            )
                .enqueue(object : Callback<TaskResponse> {
                    override fun onFailure(call: Call<TaskResponse>, t: Throwable) {
                        Toast.makeText(applicationContext, t.localizedMessage, Toast.LENGTH_SHORT)
                            .show()
                    }

                    override fun onResponse(
                        call: Call<TaskResponse>,
                        response: Response<TaskResponse>
                    ) {
                        val taskResponse = response.body()

                        if (taskResponse?.statusCode == 200) {
                            Toast.makeText(
                                applicationContext,
                                taskResponse.message,
                                Toast.LENGTH_SHORT
                            ).show()
                            toMain()
                        } else {
                            Toast.makeText(
                                applicationContext,
                                "Task with this title already exists.",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    }
                })
        }
    }

    private fun deleteTask() {
        apiClient.getApiService().deleteTask(
            token = "Bearer ${sessionManager.fetchToken()}",
            task_id = intent.getIntExtra("Id", 0)
        )
            .enqueue(object : Callback<TaskResponse> {
                override fun onFailure(call: Call<TaskResponse>, t: Throwable) {
                    Toast.makeText(applicationContext, t.localizedMessage, Toast.LENGTH_SHORT)
                        .show()
                }

                override fun onResponse(
                    call: Call<TaskResponse>,
                    response: Response<TaskResponse>
                ) {
                    val taskResponse = response.body()

                    if (taskResponse?.statusCode == 200) {
                        Toast.makeText(
                            applicationContext,
                            taskResponse.message,
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

    private fun buttons() {
        val base = findViewById<RelativeLayout>(R.id.task_form)

        if (intent.getBooleanExtra(UPDATE, false)) {
            val buttonDelete = Button(this)
            buttonDelete.id = ViewGroup.generateViewId()
            val buttonDeleteParams = RelativeLayout.LayoutParams(dp(100f).toInt(), dp(40f).toInt())
            buttonDeleteParams.addRule(RelativeLayout.ALIGN_PARENT_START)
            buttonDeleteParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM)
            buttonDelete.layoutParams = buttonDeleteParams
            buttonDelete.background = ContextCompat.getDrawable(this, R.drawable.shape_button_delete)
            buttonDelete.text = getString(R.string.delete)
            buttonDelete.isAllCaps = false
            buttonDelete.setTextColor(getColor(R.color.white))
            buttonDelete.setOnClickListener{
                deleteTask()
            }

            val buttonEdit = Button(this)
            buttonEdit.id = ViewGroup.generateViewId()
            val buttonEditParams = RelativeLayout.LayoutParams(dp(100f).toInt(), dp(40f).toInt())
            buttonEditParams.addRule(RelativeLayout.ALIGN_PARENT_END)
            buttonEditParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM)
            buttonEdit.layoutParams = buttonEditParams
            buttonEdit.background = ContextCompat.getDrawable(this, R.drawable.shape_button)
            buttonEdit.text = getString(R.string.edit)
            buttonEdit.isAllCaps = false
            buttonEdit.setTextColor(getColor(R.color.white))
            buttonEdit.setOnClickListener {
                createOrUpdateTask()
            }

            base.addView(buttonDelete)
            base.addView(buttonEdit)
        } else {
            val buttonSubmit = Button(this)
            buttonSubmit.id = ViewGroup.generateViewId()
            val buttonSubmitParams = RelativeLayout.LayoutParams(dp(100f).toInt(), dp(40f).toInt())
            buttonSubmitParams.addRule(RelativeLayout.ALIGN_PARENT_END)
            buttonSubmitParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM)
            buttonSubmit.layoutParams = buttonSubmitParams
            buttonSubmit.background = ContextCompat.getDrawable(this, R.drawable.shape_button)
            buttonSubmit.text = getString(R.string.submit)
            buttonSubmit.isAllCaps = false
            buttonSubmit.setTextColor(getColor(R.color.white))
            buttonSubmit.setOnClickListener {
                createOrUpdateTask()
            }

            base.addView(buttonSubmit)
        }
    }
}