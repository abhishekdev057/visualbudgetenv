package app.likhata.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.likhata.data.Repo
import app.likhata.data.Tx
import app.likhata.ui.Eyebrow
import app.likhata.ui.EmptyState
import app.likhata.ui.ErrorBox
import app.likhata.ui.LK
import app.likhata.ui.LoadingBox
import app.likhata.ui.repoVm
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDate

class ActivityViewModel(private val repo: Repo) : ViewModel() {
    private val now = LocalDate.now()
    private val _rows = MutableStateFlow<List<Tx>?>(null)
    val rows = _rows.asStateFlow()
    var error by mutableStateOf<String?>(null)
        private set

    init { load("") }

    fun load(query: String) {
        viewModelScope.launch {
            error = null
            repo.transactions(now.year, now.monthValue, search = query, limit = 100).fold(
                onSuccess = { _rows.value = it.items },
                onFailure = { error = it.message; _rows.value = emptyList() },
            )
        }
    }
}

@Composable
fun ActivityScreen(repo: Repo) {
    val vm = repoVm(repo) { ActivityViewModel(it) }
    val rows by vm.rows.collectAsState()
    var search by remember { mutableStateOf("") }

    Column(Modifier.fillMaxSize().padding(20.dp, 18.dp, 20.dp, 0.dp)) {
        Eyebrow("EVERY MOVEMENT")
        Spacer(Modifier.height(4.dp))
        Text("Activity", style = MaterialTheme.typography.headlineMedium, color = LK.text)
        Spacer(Modifier.height(16.dp))
        OutlinedTextField(
            value = search,
            onValueChange = { search = it; vm.load(it) },
            placeholder = { Text("Search descriptions or merchants") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = fieldColors(),
        )
        Spacer(Modifier.height(14.dp))

        when {
            vm.error != null -> ErrorBox(vm.error!!) { vm.load(search) }
            rows == null -> LoadingBox()
            rows!!.isEmpty() -> EmptyState("No spending yet", "Your budget is untouched. Add an expense when money moves.")
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = 96.dp),
                verticalArrangement = Arrangement.spacedBy(2.dp),
            ) {
                items(rows!!, key = { it.id }) { tx -> TxRow(tx) }
            }
        }
    }
}
