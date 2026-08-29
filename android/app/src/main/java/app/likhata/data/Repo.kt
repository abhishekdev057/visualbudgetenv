package app.likhata.data

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import java.io.IOException

class Repo(private val api: Api, private val store: TokenStore) {

    val isLoggedIn: Flow<Boolean> = store.tokenFlow.map { !it.isNullOrBlank() }

    suspend fun loadToken() {
        Network.token = store.tokenFlow.first()
    }

    private suspend fun <T> call(block: suspend () -> ApiEnvelope<T>): Result<T> = try {
        val res = block()
        if (res.success && res.data != null) {
            Result.success(res.data)
        } else {
            Result.failure(ApiException(res.error?.message ?: "Request failed", res.error?.code ?: ""))
        }
    } catch (e: IOException) {
        Result.failure(ApiException("No connection. Check your internet and try again."))
    } catch (e: retrofit2.HttpException) {
        Result.failure(ApiException(parseHttpError(e), e.code().toString()))
    } catch (e: Exception) {
        Result.failure(ApiException(e.message ?: "Unexpected error"))
    }

    private fun parseHttpError(e: retrofit2.HttpException): String = try {
        val body = e.response()?.errorBody()?.string().orEmpty()
        Regex("\"message\"\\s*:\\s*\"([^\"]+)\"").find(body)?.groupValues?.get(1)
            ?: when (e.code()) {
                401 -> "Session expired. Please sign in again."
                409 -> "Already exists."
                else -> "Request failed (${e.code()})"
            }
    } catch (_: Exception) {
        "Request failed (${e.code()})"
    }

    // ---- Auth ----------------------------------------------------------
    suspend fun login(email: String, password: String): Result<Unit> =
        call { api.login(LoginReq(email.trim(), password)) }.mapCatching { persist(it) }

    suspend fun register(name: String, email: String, password: String): Result<Unit> =
        call { api.register(RegisterReq(name.trim(), email.trim(), password)) }.mapCatching { persist(it) }

    private suspend fun persist(auth: AuthData) {
        val token = auth.accessToken ?: throw ApiException("Server did not return a session token")
        store.save(token)
        Network.token = token
    }

    suspend fun logout() {
        runCatching { api.logout() }
        store.clear()
        Network.token = null
    }

    suspend fun me(): Result<Me> = call { api.me() }

    // ---- Budget ------------------------------------------------------
    suspend fun currentBudget(year: Int, month: Int): Result<BudgetSummary?> = try {
        val res = api.currentBudget(year, month)
        if (res.success) Result.success(res.data) // data == null means "no budget yet"
        else Result.failure(ApiException(res.error?.message ?: "Could not load budget"))
    } catch (e: IOException) {
        Result.failure(ApiException("No connection. Check your internet and try again."))
    } catch (e: Exception) {
        Result.failure(ApiException(e.message ?: "Could not load budget"))
    }

    suspend fun createBudget(body: BudgetReq): Result<BudgetSummary> = call { api.createBudget(body) }

    // ---- Transactions ---------------------------------------------
    suspend fun transactions(
        year: Int? = null,
        month: Int? = null,
        envelopeId: String? = null,
        search: String? = null,
        sort: String? = null,
        limit: Int? = null,
    ): Result<TxPage> = call {
        api.transactions(year, month, envelopeId, search?.ifBlank { null }, limit, null, sort)
    }

    suspend fun addTransaction(body: TxReq): Result<Tx> = call { api.createTransaction(body) }

    suspend fun deleteTransaction(id: String): Result<Unit> = try {
        val res = api.deleteTransaction(id)
        if (res.success) Result.success(Unit)
        else Result.failure(ApiException(res.error?.message ?: "Could not delete"))
    } catch (e: Exception) {
        Result.failure(ApiException(e.message ?: "Could not delete"))
    }

    // ---- Insights & profile -------------------------------------
    suspend fun insights(year: Int, month: Int): Result<Insights?> = try {
        val res = api.insights(year, month)
        if (res.success) Result.success(res.data)
        else Result.failure(ApiException(res.error?.message ?: "Could not load insights"))
    } catch (e: Exception) {
        Result.failure(ApiException(e.message ?: "Could not load insights"))
    }

    suspend fun profile(): Result<Profile> = call { api.profile() }

    suspend fun updateDisplayName(name: String): Result<Unit> = try {
        val res = api.updateProfile(ProfilePatch(name.trim()))
        if (res.success) Result.success(Unit)
        else Result.failure(ApiException(res.error?.message ?: "Could not update"))
    } catch (e: Exception) {
        Result.failure(ApiException(e.message ?: "Could not update"))
    }
}
