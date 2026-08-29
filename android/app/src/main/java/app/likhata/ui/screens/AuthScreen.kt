package app.likhata.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.likhata.data.Repo
import app.likhata.ui.LK
import app.likhata.ui.repoVm
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthState(val loading: Boolean = false, val error: String? = null)

class AuthViewModel(private val repo: Repo) : ViewModel() {
    private val _state = MutableStateFlow(AuthState())
    val state = _state.asStateFlow()

    fun submit(signup: Boolean, name: String, email: String, password: String) {
        if (email.isBlank() || password.isBlank() || (signup && name.isBlank())) {
            _state.value = AuthState(error = "Please fill in every field.")
            return
        }
        _state.value = AuthState(loading = true)
        viewModelScope.launch {
            val result = if (signup) repo.register(name, email, password) else repo.login(email, password)
            _state.value = result.fold(
                onSuccess = { AuthState() },
                onFailure = { AuthState(error = it.message ?: "Something went wrong") },
            )
        }
    }
}

@Composable
fun AuthScreen(repo: Repo) {
    val vm = repoVm(repo) { AuthViewModel(it) }
    val state by vm.state.collectAsState()

    var signup by remember { mutableStateOf(false) }
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column(
        Modifier
            .fillMaxSize()
            .background(
                Brush.linearGradient(
                    0f to Color(0xFF141A44),
                    0.55f to Color(0xFF0A0E24),
                    1f to LK.bg,
                )
            )
            .imePadding()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp)
            .padding(top = 56.dp, bottom = 40.dp),
    ) {
        BrandMark()
        Spacer(Modifier.height(28.dp))
        Text(
            "A CALMER WAY TO PLAN YOUR MONEY",
            style = MaterialTheme.typography.labelSmall,
            color = LK.successSoft,
        )
        Spacer(Modifier.height(10.dp))
        Text("Give every rupee a purpose.", style = MaterialTheme.typography.headlineLarge, color = LK.text)
        Spacer(Modifier.height(10.dp))
        Text(
            "Turn chaotic monthly expenses into clear visual envelopes.",
            style = MaterialTheme.typography.bodyMedium,
            color = LK.muted,
        )
        Spacer(Modifier.height(28.dp))

        Row(
            Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(LK.surface2)
                .border(1.dp, LK.line, RoundedCornerShape(14.dp))
                .padding(4.dp),
        ) {
            AuthTab("Sign In", !signup, Modifier.weight(1f)) { signup = false }
            AuthTab("Create Account", signup, Modifier.weight(1f)) { signup = true }
        }
        Spacer(Modifier.height(20.dp))

        AnimatedVisibility(visible = signup) {
            Column {
                Field("Full name", name, { name = it }, KeyboardType.Text)
                Spacer(Modifier.height(12.dp))
            }
        }
        Field("Email address", email, { email = it }, KeyboardType.Email)
        Spacer(Modifier.height(12.dp))
        Field("Password", password, { password = it }, KeyboardType.Password, isPassword = true, imeAction = ImeAction.Done)

        state.error?.let {
            Spacer(Modifier.height(12.dp))
            Box(
                Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0x1AE97575))
                    .border(1.dp, Color(0x3DE97575), RoundedCornerShape(12.dp))
                    .padding(12.dp),
            ) { Text(it, color = Color(0xFFFFC4C4), style = MaterialTheme.typography.bodySmall) }
        }

        Spacer(Modifier.height(18.dp))
        Button(
            onClick = { vm.submit(signup, name, email, password) },
            enabled = !state.loading,
            modifier = Modifier.fillMaxWidth().height(52.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = LK.gold, contentColor = Color(0xFF1B1420)),
        ) {
            if (state.loading) {
                CircularProgressIndicator(Modifier.size(20.dp), color = Color(0xFF1B1420), strokeWidth = 2.dp)
            } else {
                Text(if (signup) "Create account" else "Sign in", fontWeight = FontWeight.ExtraBold)
                Spacer(Modifier.size(8.dp))
                Icon(Icons.AutoMirrored.Rounded.ArrowForward, null)
            }
        }
        Spacer(Modifier.height(14.dp))
        Text(
            if (signup) "Passwords need 10+ characters with an uppercase letter and a number."
            else "Use the same account as the Li-Khata web app.",
            style = MaterialTheme.typography.bodySmall,
            color = LK.muted,
        )
    }
}

@Composable
private fun BrandMark() {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            Modifier
                .size(44.dp)
                .clip(RoundedCornerShape(13.dp))
                .background(Brush.linearGradient(listOf(LK.success, LK.blue))),
            contentAlignment = Alignment.Center,
        ) {
            Text("₹", color = Color(0xFF04231C), fontWeight = FontWeight.ExtraBold, style = MaterialTheme.typography.titleLarge)
        }
        Spacer(Modifier.size(12.dp))
        Text("Li-Khata", style = MaterialTheme.typography.titleLarge, color = LK.text)
    }
}

@Composable
private fun AuthTab(label: String, active: Boolean, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Box(
        modifier
            .clip(RoundedCornerShape(10.dp))
            .background(if (active) LK.success else Color.Transparent)
            .clickable(onClick = onClick)
            .padding(vertical = 10.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            label,
            color = if (active) Color(0xFF04231C) else LK.muted,
            fontWeight = FontWeight.Bold,
            style = MaterialTheme.typography.bodyMedium,
        )
    }
}

@Composable
private fun Field(
    label: String,
    value: String,
    onChange: (String) -> Unit,
    keyboard: KeyboardType,
    isPassword: Boolean = false,
    imeAction: ImeAction = ImeAction.Next,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        label = { Text(label) },
        singleLine = true,
        visualTransformation = if (isPassword) PasswordVisualTransformation() else VisualTransformation.None,
        keyboardOptions = KeyboardOptions(keyboardType = keyboard, imeAction = imeAction),
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = LK.success,
            unfocusedBorderColor = LK.line,
            focusedTextColor = LK.text,
            unfocusedTextColor = LK.text,
            focusedLabelColor = LK.successSoft,
            unfocusedLabelColor = LK.muted,
            cursorColor = LK.success,
            focusedContainerColor = Color(0x99070B1A),
            unfocusedContainerColor = Color(0x99070B1A),
        ),
    )
}
