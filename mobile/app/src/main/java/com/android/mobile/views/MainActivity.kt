package com.android.mobile.views

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Typeface
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.text.InputType
import android.view.*
import android.widget.*
import androidx.core.content.ContextCompat
import com.android.mobile.R
import com.android.mobile.core.ApiClient
import com.android.mobile.core.SessionManager
import com.android.mobile.core.models.Extra
import com.android.mobile.core.models.Task
import com.android.mobile.core.models.Subtask
import com.android.mobile.core.requests.ExtraRequest
import com.android.mobile.core.requests.SubtaskRequest
import com.android.mobile.core.requests.TaskRequest
import com.android.mobile.core.responses.*
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : AppCompatActivity() {
    private lateinit var apiClient: ApiClient
    private lateinit var sessionManager: SessionManager
    private var sortPriority: Int = -1
    private var sortDate: Int = -1
    private lateinit var locale: Locale

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        apiClient = ApiClient()
        sessionManager = SessionManager(this)

        checkProfile()
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        if (sessionManager.getLocale() == "en") {
            menu?.getItem(0)?.setIcon(R.drawable.en)
        } else if (sessionManager.getLocale() == "uk") {
            menu?.getItem(0)?.setIcon(R.drawable.uk)
        }
        setLocale()
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        val id = item.itemId

        if (id == R.id.locale) {
            if (sessionManager.getLocale() == "en") {
                sessionManager.setLocale("uk")
            } else if (sessionManager.getLocale() == "uk") {
                sessionManager.setLocale("en")
            }

            setLocale()
            refresh()
        }

        if (id == R.id.sort_by_priority) {
            sortDate = -1
            sortPriority = (sortPriority + 1) % 2
            createTasks()
            return true
        }

        if (id == R.id.sort_by_date) {
            sortPriority = -1
            sortDate = (sortDate + 1) % 2
            createTasks()
            return true
        }

        if (id == R.id.logout) {
            sessionManager.removeToken()
            toLogin()
            return true
        }

        return super.onOptionsItemSelected(item)
    }

    private fun setLocale() {
        locale = Locale(sessionManager.getLocale().toString())
        val res = resources
        val dm = res.displayMetrics
        val conf = res.configuration
        conf.locale = locale
        res.updateConfiguration(conf, dm)
    }

    private fun refresh() {
        startActivity(Intent(this, MainActivity::class.java))
    }

    fun toLogin() {
        startActivity(Intent(this, LoginActivity::class.java))
    }

    fun addTask(view: View) {
        val taskIntent = Intent(this, TaskActivity::class.java)
        taskIntent.putExtra(TaskActivity.UPDATE, false)
        startActivity(taskIntent)
    }

    private fun dp(value: Float): Float {
        return value * this.resources.displayMetrics.density
    }

    private fun checkProfile() {
        if (sessionManager.fetchToken().isNullOrEmpty()) {
            toLogin()
        }

        apiClient.getApiService().profile(token = "Bearer ${sessionManager.fetchToken()}")
            .enqueue(object : Callback<ProfileResponse> {
                override fun onFailure(call: Call<ProfileResponse>, t: Throwable) {
                    Toast.makeText(applicationContext, t.localizedMessage, Toast.LENGTH_SHORT)
                        .show()
                    toLogin()
                }

                override fun onResponse(call: Call<ProfileResponse>, response: Response<ProfileResponse>) {
                    val userResponse = response.body()

                    if (userResponse?.statusCode == 401) {
                        toLogin()
                    } else {
                        createTasks()
                    }
                }
            })
    }

    private fun getTasks(onComplete: (MutableList<Task>) -> Unit) {
        apiClient.getApiService().tasks(token = "Bearer ${sessionManager.fetchToken()}")
            .enqueue(object : Callback<TasksResponse> {
                override fun onFailure(call: Call<TasksResponse>, t: Throwable) {
                    Toast.makeText(applicationContext, t.localizedMessage, Toast.LENGTH_SHORT)
                        .show()
                }

                override fun onResponse(
                    call: Call<TasksResponse>,
                    response: Response<TasksResponse>
                ) {
                    val tasksResponse = response.body()

                    if (tasksResponse?.statusCode == 200) {
                        onComplete.invoke(tasksResponse.tasks)
                    }
                }
            })
    }

    private fun getSubtasks(task_id: Int, onComplete: (MutableList<Subtask>) -> Unit) {
        apiClient.getApiService().subtasks(token = "Bearer ${sessionManager.fetchToken()}", task_id = task_id)
            .enqueue(object : Callback<SubtasksResponse> {
                override fun onFailure(call: Call<SubtasksResponse>, t: Throwable) {
                    Toast.makeText(applicationContext, t.localizedMessage, Toast.LENGTH_SHORT)
                        .show()
                }

                override fun onResponse(call: Call<SubtasksResponse>, response: Response<SubtasksResponse>) {
                    val subtasksResponse = response.body()

                    if (subtasksResponse?.statusCode == 200) {
                        onComplete.invoke(subtasksResponse.subtasks)
                    }
                }
            })
    }

    private fun getExtras(task_id: Int, onComplete: (MutableList<Extra>) -> Unit) {
        apiClient.getApiService().extras(token = "Bearer ${sessionManager.fetchToken()}", task_id = task_id)
            .enqueue(object : Callback<ExtrasResponse> {
                override fun onFailure(call: Call<ExtrasResponse>, t: Throwable) {
                    Toast.makeText(applicationContext, t.localizedMessage, Toast.LENGTH_SHORT)
                        .show()
                }

                override fun onResponse(call: Call<ExtrasResponse>, response: Response<ExtrasResponse>) {
                    val extrasResponse = response.body()

                    if (extrasResponse?.statusCode == 200) {
                        onComplete.invoke(extrasResponse.extras)
                    }
                }
            })
    }

    private fun onSubtaskDone(task_id: Int, subtask_id: Int, title: String, done: Boolean) {
        apiClient.getApiService().putSubtask(token = "Bearer ${sessionManager.fetchToken()}", task_id = task_id, subtask_id = subtask_id,
            SubtaskRequest(title = title, done = done))
            .enqueue(object : Callback<SubtaskResponse> {
                override fun onFailure(call: Call<SubtaskResponse>, t: Throwable) {
                    Toast.makeText(applicationContext, t.localizedMessage, Toast.LENGTH_SHORT)
                        .show()
                }

                override fun onResponse(call: Call<SubtaskResponse>, response: Response<SubtaskResponse>) {
                    val subtaskResponse = response.body()

                    if (subtaskResponse?.statusCode == 400) {
                        Toast.makeText(
                            applicationContext,
                            subtaskResponse.message,
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            })
    }

    private fun createSubtask(task_id: Int, subtask_id: Int) {
        val title = findViewById<EditText>(subtask_id).text.toString()

        apiClient.getApiService().postSubtask(token = "Bearer ${sessionManager.fetchToken()}", task_id = task_id, SubtaskRequest(title = title, done = false))
            .enqueue(object : Callback<SubtaskResponse> {
                override fun onFailure(call: Call<SubtaskResponse>, t: Throwable) {
                    Toast.makeText(applicationContext, t.localizedMessage, Toast.LENGTH_SHORT)
                        .show()
                }

                override fun onResponse(call: Call<SubtaskResponse>, response: Response<SubtaskResponse>) {
                    val subtaskResponse = response.body()

                    if (subtaskResponse?.statusCode == 201) {
                        Toast.makeText(
                            applicationContext,
                            subtaskResponse.message,
                            Toast.LENGTH_SHORT
                        ).show()
                        finish()
                        overridePendingTransition(0, 0)
                        startActivity(intent)
                        overridePendingTransition(0, 0)
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

    private fun createExtra(task_id: Int, extra_id: Int) {
        val information = findViewById<EditText>(extra_id).text.toString()

        apiClient.getApiService().postExtra(token = "Bearer ${sessionManager.fetchToken()}", task_id = task_id, ExtraRequest(information = information))
            .enqueue(object : Callback<ExtraResponse> {
                override fun onFailure(call: Call<ExtraResponse>, t: Throwable) {
                    Toast.makeText(applicationContext, t.localizedMessage, Toast.LENGTH_SHORT)
                        .show()
                }

                override fun onResponse(call: Call<ExtraResponse>, response: Response<ExtraResponse>) {
                    val extraResponse = response.body()

                    if (extraResponse?.statusCode == 201) {
                        Toast.makeText(
                            applicationContext,
                            extraResponse.message,
                            Toast.LENGTH_SHORT
                        ).show()
                        finish()
                        overridePendingTransition(0, 0)
                        startActivity(intent)
                        overridePendingTransition(0, 0)
                    }
                }
            })
    }

    @SuppressLint("SimpleDateFormat")
    private fun onTaskDone(task_id: Int, date: Date, title: String, description: String, priority: Int, done: Boolean) {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd").format(date).toString()

        apiClient.getApiService().putTask(token = "Bearer ${sessionManager.fetchToken()}", task_id = task_id,
            TaskRequest(date = dateFormat, title = title, description = description, priority = priority, done = done))
            .enqueue(object : Callback<TaskResponse> {
                override fun onFailure(call: Call<TaskResponse>, t: Throwable) {
                    Toast.makeText(applicationContext, t.localizedMessage, Toast.LENGTH_SHORT)
                        .show()
                }

                override fun onResponse(call: Call<TaskResponse>, response: Response<TaskResponse>) {
                    val taskResponse = response.body()

                    if (taskResponse?.statusCode == 200) {
                        Toast.makeText(
                            applicationContext,
                            taskResponse.message,
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            })
    }

    private fun createTasks() {
        getTasks { tasks ->
            val base = findViewById<LinearLayout>(R.id.container)
            base.removeAllViews()

            tasks.sortBy { it.id }

            if (sortDate == -1) {
                if (sortPriority == 0) {
                    tasks.sortBy { it.priority }
                } else if (sortPriority == 1) {
                    tasks.sortByDescending { it.priority }
                }
            }
            if (sortPriority == -1) {
                if (sortDate == 0) {
                    tasks.sortBy { it.date }
                } else if (sortDate == 1) {
                    tasks.sortByDescending { it.date }
                }
            }

            tasks.forEach { task ->
                createTask(
                    taskId = task.id,
                    taskDate = task.date,
                    taskTitle = task.title,
                    taskDescription = (task.description.ifEmpty { "No description" }),
                    taskDone = task.done,
                    taskPriority = task.priority
                )
            }
        }
    }

    private fun createExtras(task_id: Int, extra_id: Int) {
        val extras = findViewById<LinearLayout>(extra_id)

        getExtras(task_id) { taskExtras ->
            taskExtras.sortBy { it.id }
            for (extra: Extra in taskExtras) {
                val textViewExtra = TextView(this)
                textViewExtra.id = ViewGroup.generateViewId()
                val textViewExtraParams = RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(48f).toInt())
                textViewExtra.layoutParams = textViewExtraParams
                textViewExtra.compoundDrawablePadding = dp(5f).toInt()
                textViewExtra.gravity = Gravity.CENTER_VERTICAL
                textViewExtra.setPadding(dp(8f).toInt(), 0, dp(8f).toInt(), 0)
                textViewExtra.text = extra.information
                textViewExtra.setTextColor(getColor(R.color.black))
                textViewExtra.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_comment, 0, 0, 0)
                extras.addView(textViewExtra)
            }
        }
    }

    private fun createSubtasks(task_id: Int, subtask_id: Int) {
        val subtasks = findViewById<LinearLayout>(subtask_id)

        getSubtasks(task_id) { taskSubtasks ->
            taskSubtasks.sortBy { it.id }
            for (subtask: Subtask in taskSubtasks) {
                val subtaskLine = LinearLayout(this)
                subtaskLine.id = ViewGroup.generateViewId()
                subtaskLine.layoutParams = RelativeLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                )

                val checkBoxSubtask = CheckBox(this)
                checkBoxSubtask.id = ViewGroup.generateViewId()
                checkBoxSubtask.layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(48f).toInt(), dp(1f))
                checkBoxSubtask.text = subtask.title
                checkBoxSubtask.isChecked = subtask.done
                checkBoxSubtask.setOnClickListener {
                    onSubtaskDone(task_id, subtask.id, subtask.title, !subtask.done)
                }
                subtaskLine.addView(checkBoxSubtask)

                val checkBoxButtonSubtask = Button(this)
                checkBoxButtonSubtask.id = ViewGroup.generateViewId()
                checkBoxButtonSubtask.layoutParams = RelativeLayout.LayoutParams(dp(35f).toInt(), dp(37f).toInt())
                checkBoxButtonSubtask.gravity = Gravity.CENTER_VERTICAL or Gravity.CENTER_HORIZONTAL
                checkBoxButtonSubtask.background = ContextCompat.getDrawable(this, R.drawable.shape_button_box)
                checkBoxButtonSubtask.text = getString(R.string.edit_sym)
                checkBoxButtonSubtask.isAllCaps = false
                checkBoxButtonSubtask.setTextColor(getColor(R.color.white))
                checkBoxButtonSubtask.setOnClickListener{
                    val subtaskIntent = Intent(this, SubtaskActivity::class.java)
                    subtaskIntent.putExtra(SubtaskActivity.TASK_ID, task_id)
                    subtaskIntent.putExtra(SubtaskActivity.ID, subtask.id)
                    subtaskIntent.putExtra(SubtaskActivity.TITLE, subtask.title)
                    startActivity(subtaskIntent)
                }
                subtaskLine.addView(checkBoxButtonSubtask)

                subtasks.addView(subtaskLine)
            }
        }
    }

    @SuppressLint("WrongConstant", "SimpleDateFormat")
    private fun createTask(taskId: Int, taskDate: Date, taskTitle: String, taskDescription: String, taskPriority: Int, taskDone: Boolean) {
        val base = findViewById<LinearLayout>(R.id.container)

        val box = RelativeLayout(this)
        box.id = ViewGroup.generateViewId()
        box.layoutParams = RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)

        val task = RelativeLayout(this)
        task.id = ViewGroup.generateViewId()
        val taskParams = RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        taskParams.topMargin = dp(30f).toInt()
        task.layoutParams = taskParams
        task.background = ContextCompat.getDrawable(this, R.drawable.shadow_box)
        task.elevation = dp(10f)
        task.setPadding(dp(50f).toInt(), dp(50f).toInt(), dp(50f).toInt(), dp(50f).toInt())

        val buttonEdit = Button(this)
        buttonEdit.id = ViewGroup.generateViewId()
        val buttonEditParams = RelativeLayout.LayoutParams(dp(120f).toInt(), dp(50f).toInt())
        buttonEditParams.addRule(RelativeLayout.ALIGN_TOP, task.id)
        buttonEditParams.marginStart = dp(50f).toInt()
        buttonEditParams.topMargin = dp(-15f).toInt()
        buttonEdit.layoutParams = buttonEditParams
        buttonEdit.background = ContextCompat.getDrawable(this, R.drawable.shape_button_box)
        buttonEdit.gravity = Gravity.CENTER_HORIZONTAL or Gravity.CENTER_VERTICAL
        buttonEdit.text = getString(R.string.edit)
        buttonEdit.isAllCaps = false
        buttonEdit.setTextColor(getColor(R.color.white))
        buttonEdit.setOnClickListener {
            val taskIntent = Intent(this, TaskActivity::class.java)
            taskIntent.putExtra(TaskActivity.UPDATE, true)
            taskIntent.putExtra(TaskActivity.ID, taskId)
            taskIntent.putExtra(TaskActivity.TITLE, taskTitle)
            taskIntent.putExtra(TaskActivity.DATE, taskDate.time)
            taskIntent.putExtra(TaskActivity.DESCRIPTION, taskDescription)
            taskIntent.putExtra(TaskActivity.PRIORITY, taskPriority)
            startActivity(taskIntent)
        }
        box.addView(buttonEdit)

        val buttonPriority = Button(this)
        buttonPriority.id = ViewGroup.generateViewId()
        val buttonPriorityParams = RelativeLayout.LayoutParams(dp(120f).toInt(), dp(50f).toInt())
        buttonPriorityParams.addRule(RelativeLayout.ALIGN_TOP, task.id)
        buttonPriorityParams.marginStart = dp(220f).toInt()
        buttonPriorityParams.topMargin = dp(-15f).toInt()
        buttonPriority.layoutParams = buttonPriorityParams
        buttonPriority.background = ContextCompat.getDrawable(this, R.drawable.shape_button_box)
        buttonPriority.gravity = Gravity.CENTER_HORIZONTAL or Gravity.CENTER_VERTICAL
        buttonPriority.text = resources.getStringArray(R.array.priority_array)[taskPriority]
        buttonPriority.isAllCaps = false
        buttonPriority.setTextColor(getColor(R.color.white))
        box.addView(buttonPriority)

        val checkBoxTask = CheckBox(this)
        checkBoxTask.id = ViewGroup.generateViewId()
        val checkBoxTaskParams = RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(48f).toInt())
        checkBoxTaskParams.addRule(RelativeLayout.ALIGN_PARENT_START)
        checkBoxTask.layoutParams = checkBoxTaskParams
        checkBoxTask.text = taskTitle
        checkBoxTask.setOnClickListener {
            onTaskDone(taskId, taskDate, taskTitle, taskDescription, taskPriority, !taskDone)
        }
        task.addView(checkBoxTask)

        val date = TextView(this)
        date.id = ViewGroup.generateViewId()
        val dateParams = RelativeLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, dp(48f).toInt())
        dateParams.addRule(RelativeLayout.ALIGN_PARENT_END)
        date.layoutParams = dateParams
        date.compoundDrawablePadding = dp(5f).toInt()
        date.gravity = Gravity.CENTER_VERTICAL
        date.text = SimpleDateFormat("dd MMMM yyyy").format(taskDate)
        date.setTextColor(getColor(R.color.black))
        date.setCompoundDrawablesWithIntrinsicBounds(0, 0, R.drawable.ic_calendar, 0)
        task.addView(date)

        val titleDescription = TextView(this)
        titleDescription.id = ViewGroup.generateViewId()
        val titleDescriptionParams = RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(40f).toInt())
        titleDescriptionParams.addRule(RelativeLayout.BELOW, date.id)
        titleDescription.layoutParams = titleDescriptionParams
        titleDescription.gravity = Gravity.CENTER_HORIZONTAL or Gravity.CENTER_VERTICAL
        titleDescription.text = getString(R.string.description)
        titleDescription.setTextColor(getColor(R.color.black))
        titleDescription.typeface = Typeface.DEFAULT_BOLD
        task.addView(titleDescription)

        val description = TextView(this)
        description.id = ViewGroup.generateViewId()
        val descriptionParams = RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        descriptionParams.addRule(RelativeLayout.BELOW, titleDescription.id)
        description.layoutParams = descriptionParams
        description.justificationMode = 1
        description.setPadding(dp(8f).toInt(), dp(4f).toInt(), dp(8f).toInt(), dp(4f).toInt())
        description.text = taskDescription
        description.setTextColor(getColor(R.color.black))
        task.addView(description)

        val titleSubtasks = TextView(this)
        titleSubtasks.id = ViewGroup.generateViewId()
        val titleSubtasksParams = RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(40f).toInt())
        titleSubtasksParams.addRule(RelativeLayout.BELOW, description.id)
        titleSubtasks.layoutParams = titleSubtasksParams
        titleSubtasks.gravity = Gravity.CENTER_HORIZONTAL or Gravity.CENTER_VERTICAL
        titleSubtasks.text = getString(R.string.subtasks)
        titleSubtasks.setTextColor(getColor(R.color.black))
        titleSubtasks.typeface = Typeface.DEFAULT_BOLD
        task.addView(titleSubtasks)

        val subtasks = LinearLayout(this)
        subtasks.id = ViewGroup.generateViewId()
        val subtasksParams = RelativeLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
        subtasksParams.addRule(RelativeLayout.BELOW, titleSubtasks.id)
        subtasks.layoutParams = subtasksParams
        subtasks.orientation = 1
        subtasks.setPadding(dp(4f).toInt(), 0, dp(4f).toInt(), 0)
        task.addView(subtasks)

        val subtask = LinearLayout(this)
        subtask.id = ViewGroup.generateViewId()
        val subtaskParams = RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        subtaskParams.addRule(RelativeLayout.BELOW, subtasks.id)
        subtask.layoutParams = subtaskParams
        subtask.orientation = 0
        subtask.setPadding(dp(8f).toInt(), 0, 0, 0)
        val editTextSubtask = EditText(this)
        editTextSubtask.id = ViewGroup.generateViewId()
        val editTextSubtaskParams = RelativeLayout.LayoutParams(dp(180f).toInt(), ViewGroup.LayoutParams.WRAP_CONTENT)
        editTextSubtask.layoutParams = editTextSubtaskParams
        editTextSubtask.setAutofillHints("text")
        editTextSubtask.hint = getString(R.string.new_subtask)
        editTextSubtask.inputType = InputType.TYPE_CLASS_TEXT
        subtask.addView(editTextSubtask)
        val buttonSubtask = Button(this)
        buttonSubtask.id = ViewGroup.generateViewId()
        val buttonSubtaskParams = RelativeLayout.LayoutParams(dp(90f).toInt(), dp(35f).toInt())
        buttonSubtaskParams.marginStart = dp(10f).toInt()
        buttonSubtask.layoutParams = buttonSubtaskParams
        buttonSubtask.background = ContextCompat.getDrawable(this, R.drawable.shape_button)
        buttonSubtask.gravity = Gravity.CENTER_VERTICAL or Gravity.CENTER_HORIZONTAL
        buttonSubtask.text = getString(R.string.submit)
        buttonSubtask.isAllCaps = false
        buttonSubtask.setTextColor(getColor(R.color.white))
        buttonSubtask.setOnClickListener{
            createSubtask(taskId, editTextSubtask.id)
        }
        subtask.addView(buttonSubtask)
        task.addView(subtask)

        val titleExtra = TextView(this)
        titleExtra.id = ViewGroup.generateViewId()
        val titleExtraParams = RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(40f).toInt())
        titleExtraParams.addRule(RelativeLayout.BELOW, subtask.id)
        titleExtra.layoutParams = titleExtraParams
        titleExtra.gravity = Gravity.CENTER_HORIZONTAL or Gravity.CENTER_VERTICAL
        titleExtra.text = getString(R.string.extra)
        titleExtra.setTextColor(getColor(R.color.black))
        titleExtra.typeface = Typeface.DEFAULT_BOLD
        task.addView(titleExtra)

        val extras = LinearLayout(this)
        extras.id = ViewGroup.generateViewId()
        val extrasParams = RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        extrasParams.addRule(RelativeLayout.BELOW, titleExtra.id)
        extras.layoutParams = extrasParams
        extras.orientation = 1
        extras.setPadding(dp(4f).toInt(), 0, dp(4f).toInt(), 0)
        task.addView(extras)

        val extra = LinearLayout(this)
        extra.id = ViewGroup.generateViewId()
        val extraParams = RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        extraParams.addRule(RelativeLayout.BELOW, extras.id)
        extra.layoutParams = extraParams
        extra.orientation = 0
        extra.setPadding(dp(8f).toInt(), 0, 0, 0)
        val editTextExtra = EditText(this)
        editTextExtra.id = ViewGroup.generateViewId()
        val editTextExtraParams = RelativeLayout.LayoutParams(dp(180f).toInt(), ViewGroup.LayoutParams.WRAP_CONTENT)
        editTextExtra.layoutParams = editTextExtraParams
        editTextExtra.setAutofillHints("text")
        editTextExtra.hint = getString(R.string.new_extra)
        editTextExtra.inputType = InputType.TYPE_CLASS_TEXT
        extra.addView(editTextExtra)
        val buttonExtra = Button(this)
        buttonExtra.id = ViewGroup.generateViewId()
        val buttonExtraParams = RelativeLayout.LayoutParams(dp(90f).toInt(), dp(35f).toInt())
        buttonExtraParams.marginStart = dp(10f).toInt()
        buttonExtra.layoutParams = buttonExtraParams
        buttonExtra.background = ContextCompat.getDrawable(this, R.drawable.shape_button)
        buttonExtra.gravity = Gravity.CENTER_VERTICAL or Gravity.CENTER_HORIZONTAL
        buttonExtra.text = getString(R.string.submit)
        buttonExtra.isAllCaps = false
        buttonExtra.setTextColor(getColor(R.color.white))
        buttonExtra.setOnClickListener{
            createExtra(taskId, editTextExtra.id)
        }
        extra.addView(buttonExtra)
        task.addView(extra)

        box.addView(task)
        base.addView(box)

        createSubtasks(taskId, subtasks.id)
        createExtras(taskId, extras.id)
    }
}