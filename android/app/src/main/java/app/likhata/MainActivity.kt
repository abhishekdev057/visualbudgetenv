package app.likhata

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ReceiptLong
import androidx.compose.material.icons.rounded.Analytics
import androidx.compose.material.icons.rounded.GridView
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material.icons.rounded.Wallet
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import app.likhata.data.Repo
import app.likhata.ui.LK
import app.likhata.ui.LiKhataTheme
import app.likhata.ui.LoadingBox
import app.likhata.ui.screens.ActivityScreen
import app.likhata.ui.screens.AuthScreen
import app.likhata.ui.screens.DashboardScreen
import app.likhata.ui.screens.EnvelopeDetailScreen
import app.likhata.ui.screens.InsightsScreen
import app.likhata.ui.screens.ProfileScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        val repo = (application as LiKhataApp).repo
        setContent {
            LiKhataTheme { RootApp(repo) }
        }
    }
}

private data class Tab(val route: String, val label: String, val icon: ImageVector)

private val tabs = listOf(
    Tab("overview", "Overview", Icons.Rounded.GridView),
    Tab("envelopes", "Envelopes", Icons.Rounded.Wallet),
    Tab("activity", "Activity", Icons.AutoMirrored.Rounded.ReceiptLong),
    Tab("insights", "Insights", Icons.Rounded.Analytics),
    Tab("profile", "Profile", Icons.Rounded.Person),
)

@Composable
fun RootApp(repo: Repo) {
    val loggedIn by repo.isLoggedIn.collectAsState(initial = null)
    LaunchedEffect(Unit) { repo.loadToken() }

    when (loggedIn) {
        null -> LoadingBox(Modifier.fillMaxSize())
        false -> AuthScreen(repo)
        else -> MainShell(repo)
    }
}

@Composable
private fun MainShell(repo: Repo) {
    val nav = rememberNavController()
    val entry by nav.currentBackStackEntryAsState()
    val current = entry?.destination?.route
    val tabRoutes = tabs.map { it.route }

    Scaffold(
        containerColor = LK.bg,
        bottomBar = {
            if (current == null || current in tabRoutes) {
                NavigationBar(containerColor = Color(0xF20A0D22)) {
                    tabs.forEach { tab ->
                        val selected = current == tab.route || (current == null && tab.route == "overview")
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                if (!selected) nav.navigate(tab.route) {
                                    popUpTo("overview") { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(tab.icon, tab.label) },
                            label = { Text(tab.label) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = LK.success,
                                selectedTextColor = LK.success,
                                indicatorColor = Color(0x1A00CB91),
                                unselectedIconColor = LK.muted,
                                unselectedTextColor = LK.muted,
                            ),
                        )
                    }
                }
            }
        },
    ) { pad ->
        NavHost(
            navController = nav,
            startDestination = "overview",
            modifier = Modifier.fillMaxSize().padding(pad),
        ) {
            mainGraph(repo, nav)
        }
    }
}

private fun NavGraphBuilder.mainGraph(repo: Repo, nav: NavHostController) {
    composable("overview") { DashboardScreen(repo, onOpenEnvelope = { nav.navigate("envelope/$it") }) }
    composable("envelopes") { DashboardScreen(repo, envelopesOnly = true, onOpenEnvelope = { nav.navigate("envelope/$it") }) }
    composable("activity") { ActivityScreen(repo) }
    composable("insights") { InsightsScreen(repo) }
    composable("profile") { ProfileScreen(repo) }
    composable("envelope/{id}") { back ->
        EnvelopeDetailScreen(
            repo = repo,
            envelopeId = back.arguments?.getString("id").orEmpty(),
            onBack = { nav.popBackStack() },
        )
    }
}
