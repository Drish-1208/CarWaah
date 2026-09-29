// network/CarWaahApi.kt
package com.yourpackage.carwaah.network

import com.yourpackage.carwaah.data.LoginRequest
import com.yourpackage.carwaah.data.LoginResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface CarWaahApi {

    @POST("auth/login")
    suspend fun loginUser(@Body request: LoginRequest): Response<LoginResponse>

    // We will add signup, vehicles, and bookings here later
}