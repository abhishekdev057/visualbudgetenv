package app.likhata

import android.app.Application
import app.likhata.data.Api
import app.likhata.data.Network
import app.likhata.data.Repo
import app.likhata.data.TokenStore

class LiKhataApp : Application() {
    lateinit var repo: Repo
        private set

    override fun onCreate() {
        super.onCreate()
        val api: Api = Network.build(BuildConfig.BASE_URL)
        repo = Repo(api, TokenStore(this))
    }
}
