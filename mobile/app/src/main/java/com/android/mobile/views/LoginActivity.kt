package com.android.mobile.views

import android.annotation.SuppressLint
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Toast
import com.android.mobile.R
import com.android.mobile.core.ApiClient
import com.android.mobile.core.SessionManager
import com.android.mobile.core.requests.LoginRequest
import com.android.mobile.core.responses.LoginResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import android.widget.EditText

class LoginActivity : AppCompatActivity() {
    private lateinit var sessionManager: SessionManager
    private lateinit var apiClient: ApiClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        apiClient = ApiClient()
        sessionManager = SessionManager(this)
    }

    fun toMain() {
        startActivity(Intent(this, MainActivity::class.java))
    }

    fun toRegister(view: View) {
        startActivity(Intent(this, RegisterActivity::class.java))
    }

    @SuppressLint("CutPasteId")
    fun login(view: View) {

        val email = findViewById<EditText>(R.id.loginFormEmail).text.toString()
        val password = findViewById<EditText>(R.id.loginFormPassword).text.toString()

        apiClient.getApiService().login(LoginRequest(email = email, password = password))
            .enqueue(object : Callback<LoginResponse> {
                override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                    Toast.makeText(applicationContext, t.localizedMessage, Toast.LENGTH_SHORT)
                        .show()
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
    }
}