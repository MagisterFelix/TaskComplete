package com.android.mobile.core

import android.content.Context
import android.content.SharedPreferences
import com.android.mobile.R

class SessionManager (context: Context) {
    private var prefs: SharedPreferences = context.getSharedPreferences(context.getString(R.string.app_name), Context.MODE_PRIVATE)

    companion object {
        const val USER_TOKEN = "user_token"
        const val LOCALE = "locale"
    }

    fun saveToken(token: String) {
        val editor = prefs.edit()
        editor.putString(USER_TOKEN, token)
        editor.apply()
    }

    fun setLocale(locale: String) {
        val editor = prefs.edit()
        editor.putString(LOCALE, locale)
        editor.apply()
    }

    fun fetchToken(): String? {
        return prefs.getString(USER_TOKEN, null)
    }

    fun getLocale(): String? {
        return prefs.getString(LOCALE, "en")
    }

    fun removeToken() {
        if (!fetchToken().isNullOrEmpty()) {
            val editor = prefs.edit()
            editor.remove(USER_TOKEN)
            editor.apply()
        }
    }
}