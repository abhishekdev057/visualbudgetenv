package app.likhata.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.ArrowOutward
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.likhata.data.BudgetReq
import app.likhata.data.BudgetSummary
import app.likhata.data.Envelope
import app.likhata.data.EnvelopeReq
import app.likhata.data.Repo
import app.likhata.data.Tx
import app.likhata.data.TxReq
import app.likhata.ui.AccentDot
import app.likhata.ui.Eyebrow
import app.likhata.ui.LK
import app.likhata.ui.LoadingBox
import app.likhata.ui.Panel
import app.likhata.ui.ProgressBar
import app.likhata.ui.SectionHeader
import app.likhata.ui.accentColor
import app.likhata.ui.money
import app.likhata.ui.repoVm
import app.likhata.ui.toneColor
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.OffsetDateTime

sealed interface DashUi {
    data object Loading : DashUi
    data object NoBudget : DashUi
    data class Ready(val budget: BudgetSummary, val recent: List<Tx>) : DashUi
    data class Failed(val message: String) : DashUi
}

class DashboardViewModel(private val repo: Repo) : ViewModel() {
    private val today: LocalDate = LocalDate.now()
    val year = today.year
    val month = today.monthValue

    private val _ui = MutableStateFlow<DashUi>(DashUi.Loading)
    val ui = _ui.asStateFlow()

    var working by mutableStateOf(false)
        private set

    init { refresh() }

    fun refresh() {
        viewModelScope.launch {
            _ui.value = DashUi.Loading
            repo.currentBudget(year, month).fold(
                onSuccess = { budget ->
                    if (budget == null) {
                        _ui.value = DashUi.NoBudget
                    } else {
                        val recent = repo.transactions(year, month, limit = 6).getOrNull()?.items ?: emptyList()
                        _ui.value = DashUi.Ready(budget, recent)
                    }
                },
                onFailure = { _ui.value = DashUi.Failed(it.message ?: "Could not load your plan") },
            )
        }
    }

    fun createBudget(income: String, picks: List<EnvelopeReq>, onDone: (String?) -> Unit) {
        working = true
        viewModelScope.launch {
            val res = repo.createBudget(BudgetReq(year, month, income, picks))
            working = false
            res.fold(onSuccess = { refresh(); onDone(null) }, onFailure = { onDone(it.message) })
        }
    }

    fun addExpense(budgetId: String, envelopeId: String, title: String, amount: String, onDone: (String?) -> Unit) {
        working = true
        viewModelScope.launch {
            val res = repo.addTransaction(
                TxReq(
                    budgetMonthId = budgetId,
                    envelopeId = envelopeId,
                    title = title,
                    amount = amount,
                    transactionDate = OffsetDateTime.now().toString(),
                )
            )
            working = false
            res.fold(onSuccess = { refresh(); onDone(null) }, onFailure = { onDone(it.message) })
        }
    }
}

@Composable
fun DashboardScreen(
    repo: Repo,
    envelopesOnly: Boolean = false,
    onOpenEnvelope: (String) -> Unit,
) {
    val vm = repoVm(repo) { DashboardViewModel(it) }
    val ui by vm.ui.collectAsState()
    var showAdd by remember { mutableStateOf(false) }
    var toast by remember { mutableStateOf<String?>(null) }

    Scaffold(
        containerColor = LK.bg,
        floatingActionButton = {
            val ready = ui as? DashUi.Ready
            if (ready != null && ready.budget.envelopes.any { it.type == "expense" }) {
                ExtendedFloatingActionButton(
                    onClick = { showAdd = true },
                    containerColor = LK.gold,
                    contentColor = Color(0xFF1B1420),
                    text = { Text("Expense", fontWeight = FontWeight.ExtraBold) },
                    icon = { Icon(Icons.Rounded.Add, null) },
                )
            }
        },
    ) { pad ->
        Box(Modifier.fillMaxSize().padding(pad)) {
            when (val s = ui) {
                is DashUi.Loading -> LoadingBox()
                is DashUi.Failed -> Column(Modifier.padding(20.dp)) {
                    app.likhata.ui.ErrorBox(s.message) { vm.refresh() }
                }
                is DashUi.NoBudget -> OnboardingView(working = vm.working) { income, picks ->
                    vm.createBudget(income, picks) { err -> toast = err ?: "Budget created" }
                }
                is DashUi.Ready -> {
                    val b = s.budget
                    LazyColumn(
                        Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(20.dp, 18.dp, 20.dp, 96.dp),
                        verticalArrangement = Arrangement.spacedBy(20.dp),
                    ) {
                        if (!envelopesOnly) {
                            item {
                                Eyebrow("YOUR MONTHLY PLAN")
                                Spacer(Modifier.height(4.dp))
                                Text("${monthName(vm.month)} ${vm.year}", style = MaterialTheme.typography.headlineMedium, color = LK.text)
                            }
                            item { BalanceHero(b) }
                            item { AllocationPanel(b) }
                        }
                        item {
                            SectionHeader("YOUR PLAN", if (envelopesOnly) "Your envelopes" else "Budget envelopes")
                        }
                        items(b.envelopes, key = { it.id }) { env ->
                            EnvelopeCard(env) { onOpenEnvelope(env.id) }
                        }
                        if (!envelopesOnly && s.recent.isNotEmpty()) {
                            item {
                                Spacer(Modifier.height(4.dp))
                                SectionHeader("LATEST MOVEMENT", "Recent activity")
                            }
                            items(s.recent, key = { "r" + it.id }) { tx -> TxRow(tx) }
                        }
                    }
                }
            }

            toast?.let { msg ->
                LaunchedEffect(msg) { kotlinx.coroutines.delay(2500); toast = null }
                Box(
                    Modifier.fillMaxWidth().padding(16.dp),
                    contentAlignment = Alignment.TopCenter,
                ) {
                    Text(
                        msg,
                        color = LK.text,
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(LK.surface2)
                            .border(1.dp, LK.line, RoundedCornerShape(12.dp))
                            .padding(horizontal = 16.dp, vertical = 10.dp),
                    )
                }
            }
        }
    }

    if (showAdd) {
        val ready = ui as? DashUi.Ready
        if (ready != null) {
            AddExpenseDialog(
                envelopes = ready.budget.envelopes.filter { it.type == "expense" },
                working = vm.working,
                onDismiss = { showAdd = false },
                onSubmit = { envId, title, amount ->
                    vm.addExpense(ready.budget.id, envId, title, amount) { err ->
                        showAdd = false
                        toast = err ?: "Expense added"
                    }
                },
            )
        }
    }
}

@Composable
private fun BalanceHero(b: BudgetSummary) {
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(
                Brush.linearGradient(listOf(Color(0xFF1B2165), Color(0xFF0E1231)))
            )
            .border(1.dp, Color(0x384DE3B6), RoundedCornerShape(24.dp))
            .padding(22.dp),
    ) {
        Text("Available this month", color = LK.muted, style = MaterialTheme.typography.bodySmall)
        Spacer(Modifier.height(6.dp))
        Text(money(b.available), style = MaterialTheme.typography.headlineLarge, color = LK.text)
        Spacer(Modifier.height(20.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            HeroMetric("Income", money(b.income))
            HeroMetric("Allocated", money(b.totalAllocated))
            HeroMetric("Spent", money(b.totalSpent))
        }
        Spacer(Modifier.height(14.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            HeroMetric("Savings plan", money(b.savingsAllocation), LK.successSoft)
            HeroMetric("Unallocated", money(b.unallocated), if ((b.unallocated.toDoubleOrNull() ?: 0.0) < 0) LK.danger else LK.goldSoft)
            Spacer(Modifier.size(1.dp))
        }
    }
}

@Composable
private fun HeroMetric(label: String, value: String, valueColor: Color = LK.text) {
    Column {
        Text(label, color = LK.muted, style = MaterialTheme.typography.bodySmall)
        Spacer(Modifier.height(2.dp))
        Text(value, color = valueColor, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
    }
}

@Composable
private fun AllocationPanel(b: BudgetSummary) {
    Panel {
        SectionHeader(
            "ALLOCATION", "Where your money goes",
            trailing = { Text("${b.allocationUsed.toInt()}% assigned", color = LK.gold, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodySmall) },
        )
        val income = (b.income.toDoubleOrNull() ?: 1.0).coerceAtLeast(1.0)
        Row(
            Modifier.fillMaxWidth().height(18.dp).clip(RoundedCornerShape(100.dp)).background(Color(0xFF24241F)),
        ) {
            b.envelopes.forEach { e ->
                val w = ((e.allocatedAmount.toDoubleOrNull() ?: 0.0) / income).toFloat().coerceIn(0f, 1f)
                if (w > 0f) Box(Modifier.fillMaxWidth(w).height(18.dp).background(accentColor(e.accent)))
            }
        }
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            b.envelopes.take(4).forEach { e ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    AccentDot(e.accent, 7)
                    Spacer(Modifier.size(5.dp))
                    Text(e.name, color = LK.muted, style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}

@Composable
private fun EnvelopeCard(e: Envelope, onClick: () -> Unit) {
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(
                Brush.linearGradient(listOf(Color(0xFA1A1F41), Color(0xFA0D1127)))
            )
            .border(1.dp, LK.line, RoundedCornerShape(20.dp))
            .clickable(onClick = onClick)
            .padding(18.dp),
    ) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier.size(40.dp).clip(RoundedCornerShape(13.dp)).background(accentColor(e.accent).copy(alpha = 0.14f)),
                contentAlignment = Alignment.Center,
            ) { Text(e.name.take(1).uppercase(), color = accentColor(e.accent), fontWeight = FontWeight.Bold) }
            Icon(Icons.Rounded.ArrowOutward, null, tint = LK.muted, modifier = Modifier.size(18.dp))
        }
        Spacer(Modifier.height(10.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(6.dp).clip(RoundedCornerShape(100.dp)).background(toneColor(e.tone)))
            Spacer(Modifier.size(6.dp))
            Text(e.label, color = LK.muted, style = MaterialTheme.typography.bodySmall)
        }
        Text(e.name, style = MaterialTheme.typography.titleLarge, color = LK.text)
        Spacer(Modifier.height(8.dp))
        Text(money(e.remaining), style = MaterialTheme.typography.headlineMedium, color = LK.text)
        Text("remaining of ${money(e.allocatedAmount)}", color = LK.muted, style = MaterialTheme.typography.bodySmall)
        Spacer(Modifier.height(10.dp))
        ProgressBar((e.used / 100f).toFloat(), accentColor(e.accent))
        Spacer(Modifier.height(10.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("${money(e.actual)} ${if (e.isSavings) "saved" else "spent"}", color = LK.muted, style = MaterialTheme.typography.bodySmall)
            Text("${e.transactionCount} ${if (e.transactionCount == 1) "entry" else "entries"}", color = LK.muted, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
fun TxRow(tx: Tx) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            Modifier.size(44.dp).clip(RoundedCornerShape(14.dp)).background(accentColor(tx.envelopeAccent).copy(alpha = 0.16f)),
            contentAlignment = Alignment.Center,
        ) { Text(tx.envelopeName.take(1).uppercase(), color = accentColor(tx.envelopeAccent), fontWeight = FontWeight.Bold) }
        Spacer(Modifier.size(12.dp))
        Column(Modifier.weight(1f)) {
            Text(tx.title, color = LK.text, style = MaterialTheme.typography.titleMedium, maxLines = 1)
            Text("${tx.envelopeName} · ${prettyDate(tx.transactionDate)}", color = LK.muted, style = MaterialTheme.typography.bodySmall, maxLines = 1)
        }
        Text(
            (if (tx.isSaving) "+" else "−") + money(tx.amount).removePrefix("₹").let { "₹$it" },
            color = if (tx.isSaving) LK.success else LK.text,
            fontWeight = FontWeight.Bold,
        )
    }
}

// ---- Onboarding (first budget) ---------------------------------------
private data class Template(val name: String, val accent: String, val type: String)

private val templates = listOf(
    Template("Food", "amber", "expense"),
    Template("Rent", "violet", "expense"),
    Template("Transport", "cyan", "expense"),
    Template("Bills", "blue", "expense"),
    Template("Shopping", "rose", "expense"),
    Template("Health", "emerald", "expense"),
    Template("Savings", "violet", "savings"),
    Template("Emergency", "amber", "savings"),
)

@Composable
private fun OnboardingView(working: Boolean, onCreate: (String, List<EnvelopeReq>) -> Unit) {
    var income by remember { mutableStateOf("") }
    val amounts = remember { mutableStateMapOf<String, String>() }
    val selected = remember { mutableStateListOf<String>() }

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),
    ) {
        Eyebrow("YOUR FIRST PLAN")
        Spacer(Modifier.height(6.dp))
        Text("Give every rupee a purpose.", style = MaterialTheme.typography.headlineLarge, color = LK.text)
        Spacer(Modifier.height(8.dp))
        Text("Set your income, then pick a few envelopes to divide it into.", color = LK.muted, style = MaterialTheme.typography.bodyMedium)
        Spacer(Modifier.height(20.dp))

        MoneyField("Monthly income", income) { income = it }
        Spacer(Modifier.height(18.dp))

        Text("Envelopes", color = LK.muted, style = MaterialTheme.typography.bodySmall)
        Spacer(Modifier.height(8.dp))
        templates.forEach { t ->
            val on = selected.contains(t.name)
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(if (on) accentColor(t.accent).copy(alpha = 0.10f) else LK.surface)
                    .border(1.dp, if (on) accentColor(t.accent).copy(alpha = 0.5f) else LK.line, RoundedCornerShape(14.dp))
                    .clickable { if (on) selected.remove(t.name) else selected.add(t.name) }
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                AccentDot(t.accent)
                Spacer(Modifier.size(10.dp))
                Text(t.name, color = LK.text, modifier = Modifier.weight(1f))
                if (on) {
                    OutlinedTextField(
                        value = amounts[t.name] ?: "",
                        onValueChange = { amounts[t.name] = it.filter { c -> c.isDigit() || c == '.' } },
                        placeholder = { Text("0") },
                        prefix = { Text("₹", color = LK.gold) },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.width(120.dp),
                        colors = fieldColors(),
                    )
                }
            }
        }

        Spacer(Modifier.height(20.dp))
        Button(
            onClick = {
                val picks = selected.map { name ->
                    val t = templates.first { it.name == name }
                    EnvelopeReq(name = name, accent = t.accent, type = t.type, allocatedAmount = (amounts[name]?.ifBlank { "0" } ?: "0"))
                }
                onCreate(income.ifBlank { "0" }, picks)
            },
            enabled = !working && income.toDoubleOrNull() != null && selected.isNotEmpty(),
            modifier = Modifier.fillMaxWidth().height(52.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = LK.gold, contentColor = Color(0xFF1B1420)),
        ) { Text(if (working) "Creating…" else "Create my budget", fontWeight = FontWeight.ExtraBold) }
        Spacer(Modifier.height(40.dp))
    }
}

// ---- Add expense dialog --------------------------------------------
@Composable
private fun AddExpenseDialog(
    envelopes: List<Envelope>,
    working: Boolean,
    onDismiss: () -> Unit,
    onSubmit: (String, String, String) -> Unit,
) {
    var title by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }
    var envId by remember { mutableStateOf(envelopes.firstOrNull()?.id ?: "") }

    androidx.compose.ui.window.Dialog(onDismissRequest = onDismiss) {
        Column(
            Modifier
                .clip(RoundedCornerShape(22.dp))
                .background(Brush.linearGradient(listOf(Color(0xFF151932), Color(0xFF0E1126))))
                .border(1.dp, LK.line, RoundedCornerShape(22.dp))
                .padding(22.dp),
        ) {
            Eyebrow("QUICK ENTRY")
            Spacer(Modifier.height(4.dp))
            Text("Add an expense", style = MaterialTheme.typography.titleLarge, color = LK.text)
            Spacer(Modifier.height(16.dp))
            MoneyField("Amount", amount) { amount = it }
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = title, onValueChange = { title = it },
                label = { Text("What did you spend on?") }, singleLine = true,
                modifier = Modifier.fillMaxWidth(), colors = fieldColors(), shape = RoundedCornerShape(12.dp),
            )
            Spacer(Modifier.height(12.dp))
            Text("Envelope", color = LK.muted, style = MaterialTheme.typography.bodySmall)
            Spacer(Modifier.height(6.dp))
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                envelopes.forEach { e ->
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (envId == e.id) accentColor(e.accent).copy(alpha = 0.12f) else LK.surface)
                            .border(1.dp, if (envId == e.id) accentColor(e.accent).copy(alpha = 0.5f) else LK.line, RoundedCornerShape(12.dp))
                            .clickable { envId = e.id }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        AccentDot(e.accent)
                        Spacer(Modifier.size(8.dp))
                        Text(e.name, color = LK.text, modifier = Modifier.weight(1f))
                        Text("${money(e.remaining)} left", color = LK.muted, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
            Spacer(Modifier.height(18.dp))
            Button(
                onClick = { onSubmit(envId, title.trim(), amount) },
                enabled = !working && title.isNotBlank() && (amount.toDoubleOrNull() ?: 0.0) > 0.0 && envId.isNotBlank(),
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = LK.gold, contentColor = Color(0xFF1B1420)),
            ) { Text(if (working) "Saving…" else "Add expense", fontWeight = FontWeight.ExtraBold) }
        }
    }
}

@Composable
fun MoneyField(label: String, value: String, onChange: (String) -> Unit) {
    OutlinedTextField(
        value = value,
        onValueChange = { onChange(it.filter { c -> c.isDigit() || c == '.' }) },
        label = { Text(label) },
        prefix = { Text("₹", color = LK.gold, fontWeight = FontWeight.Bold) },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = fieldColors(),
    )
}

@Composable
fun fieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = LK.success,
    unfocusedBorderColor = LK.line,
    focusedTextColor = LK.text,
    unfocusedTextColor = LK.text,
    focusedLabelColor = LK.successSoft,
    unfocusedLabelColor = LK.muted,
    cursorColor = LK.success,
    focusedContainerColor = Color(0x99070B1A),
    unfocusedContainerColor = Color(0x99070B1A),
)

fun monthName(m: Int): String = listOf(
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
).getOrElse(m - 1) { "Month" }

fun prettyDate(iso: String): String = try {
    val d = OffsetDateTime.parse(iso)
    "${d.dayOfMonth} ${monthName(d.monthValue).take(3)} ${d.year}"
} catch (_: Exception) {
    iso.take(10)
}
