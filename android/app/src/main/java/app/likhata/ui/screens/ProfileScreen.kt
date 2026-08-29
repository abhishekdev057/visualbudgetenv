package app.likhata.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.likhata.data.Profile
import app.likhata.data.Repo
import app.likhata.ui.Eyebrow
import app.likhata.ui.LK
import app.likhata.ui.LoadingBox
import app.likhata.ui.Panel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ProfileViewModel(private val repo: Repo) : ViewModel() {
    private val _profile = MutableStateFlow<Profile?>(null)
    val profile = _profile.asStateFlow()

    init {
        viewModelScope.launch { _profile.value = repo.profile().getOrNull() }
    }

    fun signOut() {
        viewModelScope.launch { repo.logout() }
    }
}

@Composable
fun ProfileScreen(repo: Repo) {
    val vm = app.likhata.ui.repoVm(repo) { ProfileViewModel(it) }
    val profile by vm.profile.collectAsState()

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp, 18.dp, 20.dp, 96.dp),
    ) {
        Eyebrow("YOUR LI-KHATA")
        Spacer(Modifier.height(4.dp))
        Text("Profile", style = MaterialTheme.typography.headlineMedium, color = LK.text)
        Spacer(Modifier.height(24.dp))

        if (profile == null) {
            Box(Modifier.fillMaxWidth().height(160.dp)) { LoadingBox() }
        } else {
            val p = profile!!
            Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    Modifier.size(84.dp).clip(CircleShape).background(Brush.linearGradient(listOf(LK.success, LK.blue))),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        p.displayName.take(1).uppercase(),
                        color = Color(0xFF09112A),
                        fontWeight = FontWeight.ExtraBold,
                        style = MaterialTheme.typography.headlineMedium,
                    )
                }
                Spacer(Modifier.height(14.dp))
                Text(p.displayName, style = MaterialTheme.typography.headlineMedium, color = LK.text)
                Spacer(Modifier.height(2.dp))
                Text(p.email ?: p.phone?.let { "+$it" } ?: "—", color = LK.muted, style = MaterialTheme.typography.bodyMedium)
            }
            Spacer(Modifier.height(24.dp))
            Panel {
                Eyebrow("ACCOUNT")
                Spacer(Modifier.height(10.dp))
                Info("Email", p.email ?: "Not linked")
                Info("Mobile", p.phone?.let { "+$it" } ?: "Not linked")
                Info("Currency", p.currency)
                Info("Email verified", if (p.emailVerifiedAt != null) "Yes" else "No")
                Info("Mobile verified", if (p.phoneVerifiedAt != null) "Yes" else "No")
            }
            Spacer(Modifier.height(20.dp))
            Button(
                onClick = { vm.signOut() },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = LK.surface2, contentColor = LK.danger),
            ) { Text("Sign out", fontWeight = FontWeight.Bold) }
        }
    }
}

@Composable
private fun Info(label: String, value: String) {
    androidx.compose.foundation.layout.Row(
        Modifier.fillMaxWidth().padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(label, color = LK.muted, style = MaterialTheme.typography.bodyMedium)
        Text(value, color = LK.text, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
    }
}
