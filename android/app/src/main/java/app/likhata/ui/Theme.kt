package app.likhata.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

object LK {
    val bg = Color(0xFF070916)
    val surface = Color(0xFF10142A)
    val surface2 = Color(0xFF171C37)
    val line = Color(0x28A6A6FF) // rgba(156,166,255,.16)
    val text = Color(0xFFF8F9FF)
    val muted = Color(0xFFA2AAC8)
    val gold = Color(0xFFF4A61D)
    val goldSoft = Color(0xFFFFD47B)
    val success = Color(0xFF00CB91)
    val successSoft = Color(0xFF4CE5B7)
    val violet = Color(0xFF8F86F2)
    val cyan = Color(0xFF27CFC1)
    val blue = Color(0xFF6570EC)
    val rose = Color(0xFFFB7185)
    val danger = Color(0xFFE97575)
    val warning = Color(0xFFF1AD43)
}

fun accentColor(name: String): Color = when (name) {
    "violet" -> LK.violet
    "cyan" -> LK.cyan
    "rose" -> LK.rose
    "emerald" -> LK.success
    "blue" -> LK.blue
    else -> LK.gold
}

fun toneColor(tone: String): Color = when (tone) {
    "danger" -> LK.danger
    "warning" -> LK.warning
    "success" -> LK.success
    else -> LK.muted
}

private val scheme = darkColorScheme(
    primary = LK.gold,
    onPrimary = Color(0xFF1B1420),
    secondary = LK.success,
    onSecondary = Color(0xFF04231C),
    background = LK.bg,
    onBackground = LK.text,
    surface = LK.surface,
    onSurface = LK.text,
    surfaceVariant = LK.surface2,
    onSurfaceVariant = LK.muted,
    outline = LK.line,
    error = LK.danger,
)

private val typography = Typography(
    headlineLarge = TextStyle(fontWeight = FontWeight.ExtraBold, fontSize = 30.sp, letterSpacing = (-1).sp),
    headlineMedium = TextStyle(fontWeight = FontWeight.Bold, fontSize = 23.sp, letterSpacing = (-0.6).sp),
    titleLarge = TextStyle(fontWeight = FontWeight.Bold, fontSize = 19.sp, letterSpacing = (-0.4).sp),
    titleMedium = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 15.sp),
    bodyMedium = TextStyle(fontSize = 14.sp, lineHeight = 20.sp),
    bodySmall = TextStyle(fontSize = 12.sp, color = LK.muted),
    labelSmall = TextStyle(fontWeight = FontWeight.Bold, fontSize = 11.sp, letterSpacing = 1.4.sp),
)

@Composable
fun LiKhataTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = scheme, typography = typography, content = content)
}
