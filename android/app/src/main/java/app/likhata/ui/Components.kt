package app.likhata.ui

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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Inbox
import java.text.NumberFormat
import java.util.Locale

private val inr = NumberFormat.getIntegerInstance(Locale("en", "IN"))

fun money(value: String?): String {
    val n = value?.toDoubleOrNull() ?: 0.0
    val neg = n < 0
    return (if (neg) "-₹" else "₹") + inr.format(kotlin.math.abs(n).toLong())
}

@Composable
fun Panel(
    modifier: Modifier = Modifier,
    padding: PaddingValues = PaddingValues(18.dp),
    content: @Composable androidx.compose.foundation.layout.ColumnScope.() -> Unit,
) {
    Column(
        modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(
                Brush.linearGradient(
                    listOf(Color(0xF2171C37), Color(0xF20D1024))
                )
            )
            .border(1.dp, LK.line, RoundedCornerShape(20.dp))
            .padding(padding),
        content = content,
    )
}

@Composable
fun Eyebrow(text: String, color: Color = LK.muted) {
    Text(text.uppercase(), style = MaterialTheme.typography.labelSmall, color = color)
}

@Composable
fun SectionHeader(eyebrow: String, title: String, trailing: (@Composable () -> Unit)? = null) {
    Row(
        Modifier.fillMaxWidth().padding(bottom = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Bottom,
    ) {
        Column {
            Eyebrow(eyebrow)
            Spacer(Modifier.height(3.dp))
            Text(title, style = MaterialTheme.typography.titleLarge, color = LK.text)
        }
        trailing?.invoke()
    }
}

@Composable
fun ProgressBar(fraction: Float, color: Color, track: Color = Color(0x22ABB5FF), height: Int = 6) {
    Box(
        Modifier
            .fillMaxWidth()
            .height(height.dp)
            .clip(CircleShape)
            .background(track)
    ) {
        Box(
            Modifier
                .fillMaxWidth(fraction.coerceIn(0f, 1f))
                .height(height.dp)
                .clip(CircleShape)
                .background(Brush.horizontalGradient(listOf(color, color.copy(alpha = 0.75f))))
        )
    }
}

@Composable
fun AccentDot(accent: String, size: Int = 8) {
    Box(
        Modifier
            .size(size.dp)
            .clip(CircleShape)
            .background(accentColor(accent))
    )
}

@Composable
fun LoadingBox(modifier: Modifier = Modifier) {
    Box(modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(color = LK.success, strokeWidth = 3.dp)
    }
}

@Composable
fun ErrorBox(message: String, onRetry: () -> Unit) {
    Panel(padding = PaddingValues(24.dp)) {
        Text(message, color = LK.muted, style = MaterialTheme.typography.bodyMedium)
        Spacer(Modifier.height(10.dp))
        TextButton(onClick = onRetry) { Text("Try again", color = LK.successSoft, fontWeight = FontWeight.Bold) }
    }
}

@Composable
fun EmptyState(title: String, subtitle: String) {
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color(0x80171C37))
            .border(1.dp, LK.line, RoundedCornerShape(20.dp))
            .padding(vertical = 40.dp, horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            Modifier.size(52.dp).clip(RoundedCornerShape(16.dp)).background(Color(0x1AF4A61D)),
            contentAlignment = Alignment.Center,
        ) { Icon(Icons.Rounded.Inbox, null, tint = LK.gold) }
        Spacer(Modifier.height(14.dp))
        Text(title, style = MaterialTheme.typography.titleMedium, color = LK.text)
        Spacer(Modifier.height(4.dp))
        Text(subtitle, style = MaterialTheme.typography.bodySmall, color = LK.muted)
    }
}
