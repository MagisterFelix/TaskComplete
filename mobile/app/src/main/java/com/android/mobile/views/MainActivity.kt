package com.android.mobile.views

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import com.android.mobile.R
import com.android.mobile.core.ApiClient
import com.android.mobile.core.SessionManager
import com.android.mobile.core.responses.ProfileResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : AppCompatActivity() {
    private lateinit var apiClient: ApiClient
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        apiClient = ApiClient()
        sessionManager = SessionManager(this)

        profile()
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        val id = item.itemId

        if (id == R.id.logout) {
            sessionManager.removeToken()
            toLogin()
            return true
        }

        return super.onOptionsItemSelected(item)
    }

    fun toLogin() {
        startActivity(Intent(this, LoginActivity::class.java))
    }

    private fun profile() {
        if (sessionManager.fetchToken().isNullOrEmpty()) {
            toLogin()
        }

        apiClient.getApiService().profile(token = "Bearer ${sessionManager.fetchToken()}")
            .enqueue(object : Callback<ProfileResponse> {
                override fun onFailure(call: Call<ProfileResponse>, t: Throwable) {
                    Toast.makeText(applicationContext, t.localizedMessage, Toast.LENGTH_SHORT)
                        .show()
                }

                override fun onResponse(call: Call<ProfileResponse>, response: Response<ProfileResponse>) {
                    val userResponse = response.body()

                    if (userResponse?.statusCode == 200) {
                        Toast.makeText(
                            applicationContext,
                            userResponse.message,
                            Toast.LENGTH_SHORT
                        ).show()
                    } else if (userResponse?.statusCode == 401) {
                        Toast.makeText(
                            applicationContext,
                            userResponse.message,
                            Toast.LENGTH_SHORT
                        ).show()
                        toLogin()
                    }
                }
            })
    }
}