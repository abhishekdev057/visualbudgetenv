# Li-Khata — Android app

Native Android client for the Visual Budget Envelope Planner, built with
**Kotlin + Jetpack Compose (Material 3)**. It talks to the live API at
`https://visualbudgetenv.vercel.app/` using bearer-token auth
(`client: "mobile"` → `accessToken`, stored in DataStore).

## What it does

| Screen | API |
|---|---|
| Sign in / Create account (email + password) | `POST /api/v1/auth/{login,register}` |
| Overview — balance hero, allocation bar, envelopes, recent activity | `GET /api/v1/budgets/current`, `GET /api/v1/transactions` |
| First-run onboarding — set income, pick template envelopes | `POST /api/v1/budgets` |
| Add expense (FAB) | `POST /api/v1/transactions` |
| Envelopes list + envelope detail with its history | `GET /api/v1/budgets/current`, `GET /api/v1/transactions?envelopeId=` |
| Activity — searchable transaction list | `GET /api/v1/transactions` |
| Insights — spending by category + signals | `GET /api/v1/insights` |
| Profile — account details, sign out | `GET /api/v1/profile`, `POST /api/v1/auth/logout` |

The session token persists, so the app opens straight to the dashboard on relaunch.

## Build

Requires JDK 17 and the Android SDK (platform 35, build-tools 35).

```bash
cd android
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=$HOME/Library/Android/sdk
./gradlew assembleDebug      # -> app/build/outputs/apk/debug/app-debug.apk
./gradlew assembleRelease    # -> app/build/outputs/apk/release/app-release.apk  (debug-signed, sideloadable)
```

## Install on a phone

```bash
adb install -r app/build/outputs/apk/release/app-release.apk
```

Or AirDrop / copy the `.apk` to the phone and open it (enable
"install unknown apps" for your file manager once).

## Config

`applicationId` = `app.likhata`, `minSdk` 26, `targetSdk` 35.
The API base URL is compiled in via `BuildConfig.BASE_URL` in
`app/build.gradle.kts` — change it there to point at a different backend.

## Stack

Compose BOM 2024.09.03 · Navigation-Compose · Lifecycle ViewModel ·
Retrofit 2.11 + OkHttp 4.12 + kotlinx.serialization · DataStore Preferences ·
AGP 8.7.3 · Kotlin 2.0.21 · Gradle 8.11.1.
