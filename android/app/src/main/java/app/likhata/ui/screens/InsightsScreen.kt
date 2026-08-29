package app.likhata.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.likhata.data.Insights
import app.likhata.data.Repo
import app.likhata.ui.AccentDot
import app.likhata.ui.Eyebrow
import app.likhata.ui.EmptyState
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

class InsightsViewModel(private val repo: Repo) : ViewModel() {
    private val now = LocalDate.now()
    private val _data = MutableStateFlow<Result<Insights?>?>(null)
    val data = _data.asStateFlow()

    init { load() }
    fun load() {
        viewModelScope.launch {
            _data.value = null
            _data.value = repo.insights(now.year, now.monthValue)
        }
    }
}

@Composable
fun InsightsScreen(repo: Repo) {
    val vm = repoVm(repo) { InsightsViewModel(it) }
    val result by vm.data.collectAsState()

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp, 18.dp, 20.dp, 96.dp),
    ) {
        Eyebrow("PATTERNS, NOT GUESSES")
        Spacer(Modifier.height(4.dp))
        Text("Insights", style = MaterialTheme.typography.headlineMedium, color = LK.text)
        Spacer(Modifier.height(18.dp))

        when {
            result == null -> Box(Modifier.fillMaxWidth().height(200.dp)) { LoadingBox() }
            result!!.isFailure -> app.likhata.ui.ErrorBox(result!!.exceptionOrNull()?.message ?: "Could not load insights") { vm.load() }
            else -> {
                val data = result!!.getOrNull()
                if (data == null || (data.spendingByCategory.isEmpty() && data.insights.isEmpty())) {
                    EmptyState("No spending to chart", "Insights appear as you record expenses this month.")
                } else {
                    Panel {
                        SectionHeader("THIS MONTH", "Spending by category")
                        data.spendingByCategory.forEach { c ->
                            Row(Modifier.fillMaxWidth().padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                                AccentDot(c.accent)
                                Spacer(Modifier.size(8.dp))
                                Column(Modifier.weight(1f)) {
                                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text(c.name, color = LK.text, style = MaterialTheme.typography.bodyMedium)
                                        Text("${money(c.amount)}  ${c.percentage.toInt()}%", color = LK.muted, style = MaterialTheme.typography.bodySmall)
                                    }
                                    Spacer(Modifier.height(5.dp))
                                    ProgressBar((c.percentage / 100.0).toFloat(), accentColor(c.accent), height = 5)
                                }
                            }
                        }
                    }
                    Spacer(Modifier.height(18.dp))
                    Eyebrow("SIGNALS")
                    Spacer(Modifier.height(4.dp))
                    Text("What deserves attention", style = MaterialTheme.typography.titleLarge, color = LK.text)
                    Spacer(Modifier.height(12.dp))
                    data.insights.forEach { s ->
                        Column(
                            Modifier
                                .fillMaxWidth()
                                .padding(bottom = 10.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(LK.surface)
                                .padding(16.dp),
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(Modifier.size(6.dp).clip(RoundedCornerShape(100.dp)).background(toneColor(s.tone)))
                                Spacer(Modifier.size(8.dp))
                                Text(s.title, color = LK.text, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                            }
                            Spacer(Modifier.height(6.dp))
                            Text(s.body, color = LK.muted, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }
}
