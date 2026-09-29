package com.example.carwaah.ui

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.yourpackage.carwaah.data.LoginRequest
import com.yourpackage.carwaah.network.RetrofitClient
import kotlinx.coroutines.launch

class LoginViewModel : ViewModel() {
    var email = mutableStateOf("")
    var password = mutableStateOf("")
    var isLoading = mutableStateOf(false)
    var errorMessage = mutableStateOf<String?>(null)
    var loginSuccess = mutableStateOf(false)

    fun login() {
        if (email.value.isBlank() || password.value.isBlank()) {
            errorMessage.value = "Please enter email and password"
            return
        }

        isLoading.value = true
        errorMessage.value = null

        viewModelScope.launch {
            try {
                val request = LoginRequest(email.value, password.value)
                val response = RetrofitClient.api.loginUser(request)

                if (response.isSuccessful && response.body() != null) {
                    // In a full app, you would save response.body()!!.token to SharedPreferences/DataStore here
                    loginSuccess.value = true
                } else {
                    errorMessage.value = "Login failed. Check credentials."
                }
            } catch (e: Exception) {
                errorMessage.value = "Network error: Make sure backend is running"
            } finally {
                isLoading.value = false
            }
        }
    }
}