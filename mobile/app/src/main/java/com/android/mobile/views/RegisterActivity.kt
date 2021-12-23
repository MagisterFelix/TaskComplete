package com.android.mobile.views

import android.annotation.SuppressLint
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.EditText
import android.widget.Toast
import com.android.mobile.R
import com.android.mobile.core.ApiClient
import com.android.mobile.core.SessionManager
import com.android.mobile.core.requests.LoginRequest
import com.android.mobile.core.requests.RegisterRequest
import com.android.mobile.core.responses.LoginResponse
import com.android.mobile.core.responses.RegisterResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegisterActivity : AppCompatActivity() {
    private lateinit var sessionManager: SessionManager
    private lateinit var apiClient: ApiClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        apiClient = ApiClient()
        sessionManager = SessionManager(this)
    }

    fun toMain() {
        startActivity(Intent(this, MainActivity::class.java))
    }

    fun toLogin(view: View) {
        startActivity(Intent(this, LoginActivity::class.java))
    }

    private fun validateName(name: EditText): Boolean {
        if (name.text.toString().isEmpty()) {
            name.error = "Field can't be empty"
            return false
        } else {
            name.error = null
        }
        return true
    }

    private fun validateEmail(email: EditText): Boolean {
        val emailPattern = Regex("^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}\$")

        if (email.text.toString().isEmpty()) {
            email.error = "Field can't be empty"
            return false
        } else if (!email.text.toString().matches(emailPattern)) {
            email.error = "Invalid email"
            return false
        } else {
            email.error = null
        }
        return true
    }

    private fun validatePassword(password: EditText): Boolean {
        when {
            password.text.toString().isEmpty() -> {
                password.error = "Field can't be empty"
                return false
            }
            password.text.toString().length < 8 -> {
                password.error = "Invalid password"
                return false
            }
            else -> {
                password.error = null
            }
        }
        return true
    }

    private fun validateRPassword(password: EditText, repeated: EditText): Boolean {
        when {
            repeated.text.toString().isEmpty() -> {
                repeated.error = "Field can't be empty"
                return false
            }
            password.text.toString() != repeated.text.toString() -> {
                repeated.error = "Mismatch"
                return false
            }
            else -> {
                repeated.error = null
            }
        }
        return true
    }

    @SuppressLint("CutPasteId")
    fun register(view: View) {

        val name = findViewById<EditText>(R.id.registerFormName)
        val email = findViewById<EditText>(R.id.registerFormEmail)
        val password = findViewById<EditText>(R.id.registerFormPassword)
        val repeated = findViewById<EditText>(R.id.registerFormRepeatPassword)

        if (!validateName(name) || !validateEmail(email) || !validatePassword(password) || !validateRPassword(password, repeated)) {
            return
        }

        apiClient.getApiService().register(RegisterRequest(name = name.text.toString(), email = email.text.toString(), password = password.text.toString()))
            .enqueue(object : Callback<RegisterResponse> {
                override fun onFailure(call: Call<RegisterResponse>, t: Throwable) {
                    Toast.makeText(applicationContext, t.localizedMessage, Toast.LENGTH_SHORT)
                        .show()
                }

                override fun onResponse(
                    call: Call<RegisterResponse>,
                    response: Response<RegisterResponse>
                ) {
                    val registerResponse = response.body()

                    if (registerResponse?.statusCode == 201) run {
                        apiClient.getApiService()
                            .login(LoginRequest(email = email.text.toString(), password = password.text.toString()))
                            .enqueue(object : Callback<LoginResponse> {
                                override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                                    Toast.makeText(
                                        applicationContext,
                                        t.localizedMessage,
                                        Toast.LENGTH_SHORT
                                    ).show()
                                }

                                override fun onResponse(
                                    call: Call<LoginResponse>,
                                    response: Response<LoginResponse>
                                ) {
                                    val loginResponse = response.body()

                                    if (loginResponse?.statusCode == 200) {
                                        sessionManager.saveToken(loginResponse.token)
                                        toMain()
                                    } else {
                                        Toast.makeText(
                                            applicationContext,
                                            "No user with this email and password was found.",
                                            Toast.LENGTH_SHORT
                                        ).show()
                                    }
                                }
                            })
                    } else {
                        Toast.makeText(
                            applicationContext,
                            "User already exists.",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            })
    }
}