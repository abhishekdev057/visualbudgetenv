package app.likhata.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ApiEnvelope<T>(
    val success: Boolean = false,
    val data: T? = null,
    val error: ApiError? = null,
)

@Serializable
data class ApiError(val code: String = "", val message: String = "Something went wrong")

class ApiException(message: String, val code: String = "") : Exception(message)

// ---- Auth ----------------------------------------------------------------
@Serializable
data class AuthUser(val id: String, val email: String? = null, val displayName: String? = null)

@Serializable
data class AuthData(
    val user: AuthUser? = null,
    val accessToken: String? = null,
    val expiresAt: String? = null,
)

@Serializable
data class Me(
    val id: String,
    val email: String? = null,
    val phone: String? = null,
    val displayName: String = "",
    val avatarUrl: String? = null,
    val currency: String = "INR",
    val locale: String = "en-IN",
    val timezone: String = "Asia/Kolkata",
    val hasPassword: Boolean = false,
)

@Serializable
data class Profile(
    val id: String,
    val email: String? = null,
    val emailVerifiedAt: String? = null,
    val phone: String? = null,
    val phoneVerifiedAt: String? = null,
    val displayName: String = "",
    val avatarUrl: String? = null,
    val currency: String = "INR",
    val locale: String = "en-IN",
    val timezone: String = "Asia/Kolkata",
    val createdAt: String? = null,
)

// ---- Budget ------------------------------------------------------------
@Serializable
data class Envelope(
    val id: String,
    val name: String,
    val icon: String = "WalletCards",
    val accent: String = "amber",
    val type: String = "expense",
    val allocatedAmount: String = "0",
    val sortOrder: Int = 0,
    val spent: String = "0",
    val saved: String = "0",
    val transactionCount: Int = 0,
    val remaining: String = "0",
    val used: Double = 0.0,
    val label: String = "On track",
    val tone: String = "success",
) {
    val isSavings get() = type == "savings"
    val actual get() = if (isSavings) saved else spent
}

@Serializable
data class BudgetSummary(
    val id: String,
    val year: Int,
    val month: Int,
    val income: String = "0",
    val totalAllocated: String = "0",
    val unallocated: String = "0",
    val totalSpent: String = "0",
    val available: String = "0",
    val savingsAllocation: String = "0",
    val savingsRate: Double = 0.0,
    val allocationUsed: Double = 0.0,
    val envelopes: List<Envelope> = emptyList(),
)

// ---- Transactions ----------------------------------------------------
@Serializable
data class Tx(
    val id: String,
    val title: String,
    val amount: String,
    val transactionDate: String,
    val note: String? = null,
    val merchant: String? = null,
    val type: String = "expense",
    val envelopeId: String,
    val envelopeName: String = "",
    val envelopeIcon: String = "WalletCards",
    val envelopeAccent: String = "amber",
    val budgetMonthId: String = "",
) {
    val isSaving get() = type == "saving"
}

@Serializable
data class TxPage(val items: List<Tx> = emptyList(), val nextCursor: String? = null)

// ---- Insights ------------------------------------------------------
@Serializable
data class Signal(val id: String = "", val title: String = "", val body: String = "", val tone: String = "info")

@Serializable
data class CategorySpend(val name: String = "", val amount: String = "0", val percentage: Double = 0.0, val accent: String = "amber")

@Serializable
data class TrendPoint(val date: String = "", val amount: String = "0")

@Serializable
data class Insights(
    val insights: List<Signal> = emptyList(),
    val spendingByCategory: List<CategorySpend> = emptyList(),
    val dailyTrend: List<TrendPoint> = emptyList(),
)

// ---- Request bodies ------------------------------------------------
@Serializable
data class LoginReq(val email: String, val password: String, val client: String = "mobile")

@Serializable
data class RegisterReq(val displayName: String, val email: String, val password: String, val client: String = "mobile")

@Serializable
data class EnvelopeReq(
    val name: String,
    val icon: String = "WalletCards",
    val accent: String = "amber",
    val type: String = "expense",
    val allocatedAmount: String = "0",
)

@Serializable
data class BudgetReq(val year: Int, val month: Int, val income: String, val envelopes: List<EnvelopeReq> = emptyList())

@Serializable
data class ProfilePatch(val displayName: String)

@Serializable
data class TxReq(
    val budgetMonthId: String,
    val envelopeId: String,
    val title: String,
    val amount: String,
    val transactionDate: String,
    val merchant: String? = null,
    val note: String? = null,
)
