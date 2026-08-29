package app.likhata.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.likhata.data.Envelope
import app.likhata.data.Repo
import app.likhata.data.Tx
import app.likhata.ui.Eyebrow
import app.likhata.ui.EmptyState
import app.likhata.ui.LK
import app.likhata.ui.LoadingBox
import app.likhata.ui.ProgressBar
import app.likhata.ui.accentColor
import app.likhata.ui.money
import app.likhata.ui.repoVm
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDate

data class DetailData(val envelope: Envelope?, val rows: List<Tx>)

class EnvelopeDetailViewModel(private val repo: Repo, private val envelopeId: String) : ViewModel() {
    private val now = LocalDate.now()
    private val _state = MutableStateFlow<DetailData?>(null)
    val state = _state.asStateFlow()

    init { load() }
    fun load() {
        viewModelScope.launch {
            val budget = repo.currentBudget(now.year, now.monthValue).getOrNull()
            val env = budget?.envelopes?.firstOrNull { it.id == envelopeId }
            val rows = repo.transactions(envelopeId = envelopeId, year = now.year, month = now.monthValue, limit = 100)
                .getOrNull()?.items ?: emptyList()
            _state.value = DetailData(env, rows)
        }
    }
}

@Composable
fun EnvelopeDetailScreen(repo: Repo, envelopeId: String, onBack: () -> Unit) {
    val vm = repoVm(repo) { EnvelopeDetailViewModel(it, envelopeId) }
    val state by vm.state.collectAsState()

    Column(Modifier.fillMaxSize().padding(top = 12.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(horizontal = 8.dp)) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Rounded.ArrowBack, "Back", tint = LK.text) }
            Text("Envelope", color = LK.muted, style = MaterialTheme.typography.titleMedium)
        }

        when (val s = state) {
            null -> LoadingBox()
            else -> {
                val e = s.envelope
                LazyColumn(
                    Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(20.dp, 8.dp, 20.dp, 96.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    if (e != null) {
                        item {
                            Column(
                                Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(24.dp))
                                    .background(
                                        Brush.linearGradient(listOf(accentColor(e.accent).copy(alpha = 0.16f), LK.surface))
                                    )
                                    .border(1.dp, LK.line, RoundedCornerShape(24.dp))
                                    .padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                            ) {
                                Eyebrow(if (e.isSavings) "SAVINGS ENVELOPE" else "SPENDING ENVELOPE")
                                Spacer(Modifier.height(6.dp))
                                Text(e.name, style = MaterialTheme.typography.headlineMedium, color = LK.text)
                                Spacer(Modifier.height(12.dp))
                                Text(money(e.remaining), style = MaterialTheme.typography.headlineLarge, color = LK.text)
                                Text("remaining from ${money(e.allocatedAmount)}", color = LK.muted, style = MaterialTheme.typography.bodySmall)
                                Spacer(Modifier.height(16.dp))
                                ProgressBar((e.used / 100f).toFloat(), accentColor(e.accent))
                                Spacer(Modifier.height(16.dp))
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Stat(if (e.isSavings) "Saved" else "Spent", money(e.actual))
                                    Stat("Used", "${e.used.toInt()}%")
                                    Stat("Status", e.label)
                                }
                            }
                        }
                    }
                    item {
                        Spacer(Modifier.height(4.dp))
                        Eyebrow("HISTORY")
                        Spacer(Modifier.height(4.dp))
                        Text("Envelope activity", style = MaterialTheme.typography.titleLarge, color = LK.text)
                    }
                    if (s.rows.isEmpty()) {
                        item { EmptyState("Nothing here yet", "Entries in this envelope will show up here.") }
                    } else {
                        items(s.rows, key = { it.id }) { tx -> TxRow(tx) }
                    }
                }
            }
        }
    }
}

@Composable
private fun Stat(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, color = LK.muted, style = MaterialTheme.typography.bodySmall)
        Spacer(Modifier.height(3.dp))
        Text(value, color = LK.text, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
    }
}
