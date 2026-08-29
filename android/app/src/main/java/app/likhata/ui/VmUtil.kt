package app.likhata.ui

import androidx.compose.runtime.Composable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import app.likhata.data.Repo

@Composable
inline fun <reified VM : ViewModel> repoVm(repo: Repo, crossinline create: (Repo) -> VM): VM =
    viewModel(factory = viewModelFactory { initializer { create(repo) } })
