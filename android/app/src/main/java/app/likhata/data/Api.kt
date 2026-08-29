package app.likhata.data

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

interface Api {
    @POST("api/v1/auth/login")
    suspend fun login(@Body body: LoginReq): ApiEnvelope<AuthData>

    @POST("api/v1/auth/register")
    suspend fun register(@Body body: RegisterReq): ApiEnvelope<AuthData>

    @POST("api/v1/auth/logout")
    suspend fun logout(): ApiEnvelope<JsonElement>

    @GET("api/v1/auth/me")
    suspend fun me(): ApiEnvelope<Me>

    @GET("api/v1/budgets/current")
    suspend fun currentBudget(
        @Query("year") year: Int,
        @Query("month") month: Int,
    ): ApiEnvelope<BudgetSummary?>

    @POST("api/v1/budgets")
    suspend fun createBudget(@Body body: BudgetReq): ApiEnvelope<BudgetSummary>

    @GET("api/v1/transactions")
    suspend fun transactions(
        @Query("year") year: Int? = null,
        @Query("month") month: Int? = null,
        @Query("envelopeId") envelopeId: String? = null,
        @Query("search") search: String? = null,
        @Query("limit") limit: Int? = null,
        @Query("cursor") cursor: String? = null,
        @Query("sort") sort: String? = null,
    ): ApiEnvelope<TxPage>

    @POST("api/v1/transactions")
    suspend fun createTransaction(@Body body: TxReq): ApiEnvelope<Tx>

    @DELETE("api/v1/transactions/{id}")
    suspend fun deleteTransaction(@Path("id") id: String): ApiEnvelope<JsonElement>

    @GET("api/v1/insights")
    suspend fun insights(
        @Query("year") year: Int,
        @Query("month") month: Int,
    ): ApiEnvelope<Insights?>

    @GET("api/v1/profile")
    suspend fun profile(): ApiEnvelope<Profile>

    @PATCH("api/v1/profile")
    suspend fun updateProfile(@Body body: ProfilePatch): ApiEnvelope<JsonElement>
}

object Network {
    @Volatile
    var token: String? = null

    private val json = Json {
        ignoreUnknownKeys = true
        explicitNulls = false
        coerceInputValues = true
        isLenient = true
    }

    private val authInterceptor = Interceptor { chain ->
        val builder = chain.request().newBuilder()
            .header("Accept", "application/json")
            .header("User-Agent", "LiKhataAndroid/1.0")
        token?.let { builder.header("Authorization", "Bearer $it") }
        chain.proceed(builder.build())
    }

    fun build(baseUrl: String): Api {
        val client = OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()

        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(client)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(Api::class.java)
    }
}
