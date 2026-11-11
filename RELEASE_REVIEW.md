# Release review — working inventory, not approval

This document describes the current rebuild, not the absent historical v5 source. It is an internal preparation aid, **not a published privacy policy, comprehensive software bill of materials, legal opinion, or release sign-off**. Recheck it against the exact commit, lockfile, built web bundle and Android artifact before distribution. Ownership, licenses, privacy and store compliance need owner/legal review.

## Asset and rights inventory

| Asset or component | Evidence / stated source | Status before release |
|---|---|---|
| World, vehicles, roadside figures, geometry, UI, text and gameplay | Procedural Three.js/code in `src/` | Confirm contributors, ownership and rights; Bengali wording and cultural/safety framing need local review. Procedural does not by itself prove ownership. |
| Noto Sans Bengali 400/700 | `@fontsource/noto-sans-bengali` 5.3.0, imported by `src/main.js`; installed package metadata says OFL-1.1 | OFL text in `THIRD_PARTY_NOTICES/Noto-Sans-Bengali-OFL.txt`; verify full attribution and distribution requirements for the exact font and bundle. |
| Browser favicon | Emoji embedded in `index.html`; appearance supplied by the platform font | Verify platform/font licensing and replace with a clearly owned icon if needed. |
| Android icons and splash PNGs | Tracked under `android/app/src/main/res/mipmap-*` and `drawable*/splash.png` | **Origin/ownership not established.** Owner must identify source, permissions and appropriate replacements or notices. XML launcher resources also require review. |
| Audio | Runtime commentary uses browser/native text-to-speech; no recorded music/SFX found in `src/` or tracked image/audio extensions examined | Confirm rights/terms and data behavior of selected OS/browser speech providers; inspect final artifact, including any generated assets. |
| Project source and historical documentation | Repository has no root LICENSE identified | Owner must establish code ownership, contributions and a license/terms before distribution. Historical claims are not evidence of rights. |

### Direct runtime package metadata snapshot

The following versions are from `package-lock.json` and license identifiers from the locally installed package `package.json` at this review. They are metadata, **not a completed license/notice audit**. Font files and Rapier's embedded WASM may have additional distribution obligations; verify upstream license files, notices and copyrights.

| Package | Locked version | Declared license |
|---|---:|---|
| `@capacitor-community/keep-awake` | 8.0.1 | MIT |
| `@capacitor-community/text-to-speech` | 8.0.2 | MIT |
| `@capacitor/app` | 8.1.2 | MIT |
| `@capacitor/core` | 8.6.0 | MIT |
| `@capacitor/haptics` | 8.0.2 | MIT |
| `@capacitor/preferences` | 8.0.1 | MIT |
| `@capacitor/splash-screen` | 8.0.2 | MIT |
| `@capacitor/status-bar` | 8.0.4 | MIT |
| `@dimforge/rapier3d-compat` | 0.14.0 | Apache-2.0 |
| `@fontsource/noto-sans-bengali` | 5.3.0 | OFL-1.1 |
| `three` | 0.169.0 | MIT |

This table excludes transitive npm packages, build tooling, native Gradle dependencies, Android/Capacitor platform libraries and their notices. Inspect the resolved Android dependency tree and exact release artifact; compile the required complete notices and make them accessible to recipients. No Gradle dependency resolution or APK/AAB inspection was performed here.

## Privacy and data-flow inventory

| Data or capability | Current code/configuration | Open questions and limitations |
|---|---|---|
| Profile | `bangladrive_save_v6` in browser localStorage; on native, best-effort mirror through Capacitor Preferences | Stores currency, unlocks, upgrades, settings and mode medals. Browser malformed/unsupported saves are protected; native mirror conflict stops automatic mirroring. Storage can be denied or cleared; cross-tab comparison is not atomic. Test actual device restore/backup behavior. |
| Ghost | `bangladrive_ghost_v6` in localStorage | Saves best Time Trial time and sampled positions. May be lost when storage is unavailable/cleared. Not mirrored through the profile mirror. |
| First-drive guide | `bangladrive_first_drive_guide_v1` in localStorage | Stores dismissal preference; separate from the profile. |
| Optional performance check | In-memory frame intervals, rendered triangles and draw calls; optional user-entered device label; report shown for manual copying | No automatic upload is implemented by the check. User-provided label may contain personal information; advise model only. Reload/discard clears in-memory report. |
| Speech | Browser SpeechSynthesis or Capacitor TTS, controlled by voice setting | Browser/OS/provider can have independent processing and network behavior; actual providers and traffic not audited. Visible commentary stays available when muted. |
| Haptics, keep-awake, display | Vibration/Haptics, KeepAwake, StatusBar and SplashScreen plugins | Document behavior and test on supported devices. |
| Network and backups | Android manifest requests `INTERNET`, sets `allowBackup=true`; Capacitor uses local HTTPS scheme | Actual Android merged manifest, plugin permissions, backup contents, OS/cloud backup, offline behavior and network traffic require review. `allowBackup` is not proof a particular backup occurred. |
| Analytics / server | No analytics SDK or application backend found in the inspected `src/` and declared direct runtime dependencies | This is a scoped source inspection, not proof of zero outbound traffic or a full dependency/security audit. Dev server, browser, OS and TTS services may communicate independently. |

A production Chromium smoke test observed no cross-origin HTTP requests for the tested boot, drive and Rescue-cancel flow. A separate test blocked HTTP and emulated offline after boot, then changed settings, drove and cancelled Rescue; it observed no further HTTP attempts during those actions, and settings survived reconnection/reload. An uncached reload with the origin blocked did not load the game; the web build is not an offline-installable app. This is **not** an exhaustive traffic or privacy audit; it does not cover Android, every game flow, third-party speech or all browser/OS activity. No personal identifiers should be requested in reports; copying/sharing any report is the player's decision.

## Release gates still open

- [ ] Owner confirms code and asset ownership, replaces or licenses Android icons/splash, verifies fictional names/brands and obtains required notices for all shipped components.
- [ ] Resolve direct/transitive npm and Android/Gradle licenses and create a complete distributable notice bundle for the actual artifact; inspect package/WASM/font notices and any native dependencies.
- [ ] Owner/legal/privacy review approves an accurate, publicly accessible privacy policy and app-store data safety disclosures for actual deployment and jurisdictions.
- [ ] Verify Android merged manifest, INTERNET need, backup scope and restore behavior; review provider-specific text-to-speech and permissions on real devices. Do not infer from source alone.
- [ ] Inspect production network traffic and offline behavior across documented flows; test native WebView separately. Review CSP, secrets and dependencies for the exact release build.
- [ ] Run real-device install, suspend/resume, controls, accessibility, performance/thermal/memory, save/restore and crash checks; record model, OS, build and evidence. Browser emulation is not a device pass.
- [ ] Complete hands-on playthrough, screen-reader spot-check, Bengali/local cultural review, owner sign-off and outstanding P1 gates in `MASTERPLAN.md`.
