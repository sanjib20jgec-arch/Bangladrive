# DESI OVERDRIVE: BANGLA DRIFT — v6 prototype foundation

An Android-conscious Three.js (`^0.169.0`) + Rapier3D (`^0.14.0`) browser-game prototype. This checkout did not include the former v5 `src/`, assets, tooling, or native Android project. The current `src/` tree is therefore a **new prototype**, not a recovery of v5; it does not yet reproduce the seven production modes or all previously documented capabilities.

The current evidence-based roadmap and five-loop, 15-area gap sweep are in [`MASTERPLAN.md`](MASTERPLAN.md). `MASTERPLAN_LEGACY_v0.9.md` and older status/release reports are historical only; their feature claims refer to code absent from this checkout.

## Run locally

Requirements: Node.js 22.12+ and npm (Puppeteer 25 requires at least Node 22.12).

```sh
npm ci
npm run dev
```

Open the Vite URL on desktop or a phone on the same network. Keyboard: W/↑ throttle, S/↓ brake/reverse, A/← and D/→ steer, Space handbrake, Shift nitro, E horn, Esc pause/resume. If stuck, open Settings → Recover vehicle: it searches for a clear road position and cancels an active run without a mission reward; if no position is clear, the run and vehicle remain unchanged. Touch split-controls are included. The current scene is a playable driving-feel prototype, not a finished open-world game.

## Storage limitations

Profile and ghost saves are best-effort. If browser storage is denied or full, play can continue but progress and settings may not persist. A malformed or unsupported-version browser profile is left intact and the session uses temporary defaults; a warning links to Settings, where the original can be shown and copied manually or explicitly replaced with the current session. If the entry changes in another tab, writes stop and a reload is needed. Known-version fields are still normalized and may be discarded on save. This is not a backup system or an atomic cross-tab lock; concurrent writes can still race. On Android, differing browser and Preferences profiles stop mirroring rather than selecting a winner; a Settings warning distinguishes this from a local save failure. There is no in-app merge/restore for that conflict yet. Mirror writes are serialized and check for changes, but these checks are not atomic. Actual Android Preferences behavior and lifecycle remain unverified on a device. An oversized fixture is tested but there is no general storage-size or crash guarantee.

## Combo feedback

Checkpoint and style notices temporarily replace the combo readout, then restore its latest value after 2.2 seconds of simulation time. Pausing does not consume that interval; repeated notices restart it. The mission result remains separately visible in the mode status.

## HUD text size

Settings → HUD text offers Standard (default) and Large. Large enlarges speed, combo, mode status, obstruction and save-warning text; it does not scale every menu, guide or control. The preference is stored with the local profile when storage is available. Automated geometry checks cover selected HUD elements during Rescue in three emulated viewport sizes; physical-device readability and other states remain unverified.

## Touch targets

Garage and Settings buttons, selects and disclosure summaries use a minimum 48×48 CSS-pixel target; the Settings checkbox labels also provide a larger tap area. `npm run test:targets` checks selected controls and interactions in three emulated viewports. CSS pixels do not guarantee physical sizing or comfortable use on a real phone, and this is not a complete app-wide accessibility audit.

## Garage keyboard navigation

Opening Garage moves focus to Close. Tabs can be selected with keyboard; when menu content refreshes, focus returns to the same control when possible, or to its section button when the control becomes disabled. Escape closes Garage and returns focus to the game canvas. This is a focused keyboard spot-check, not a full modal or screen-reader audit.

## Mode announcements

A polite screen-reader live region reports mode selection, Delivery checkpoints, Rescue parcels, Relay links, results and cancellation. It updates on events rather than every HUD refresh; visible game HUD and commentary remain unchanged. This is an initial accessibility aid, not a screen-reader compatibility or full accessibility audit.

## Motion preference

Settings → Motion defaults to **System** and follows the device/browser reduced-motion preference; **Reduced** and **Standard** override it. Reduced mode removes vehicle body roll, drift/nitro particles, combo edge glow and several interface transitions; skid marks and essential world/camera movement remain. This is a partial motion accommodation, not a guarantee that all motion or flashing is eliminated.

## Voice commentary

Settings → Voice commentary turns text-to-speech on or off; turning it off requests cancellation of current speech, while the visible commentary remains. Entering Garage, Settings or manual/lifecycle pause also requests speech cancellation and suppresses new speech until the game resumes; interrupted lines are not replayed. This choice is saved locally with the profile. Currently no independent music or sound-effects mixer exists, so this is not a master-volume control. Actual native speech and cancellation depend on the device and remain unverified.

## Optional on-device performance check

Open **Settings → Performance check**, optionally enter only the device model, then press **Start**. Close Settings and drive for about 30 seconds, open Settings again and press **Stop**. Copy the report manually if you want to share it; **Discard** clears it. Nothing is uploaded or stored by the check. The report measures recent browser frame intervals (P50/P95 and mean FPS) and peak Three.js draw calls/rendered triangles; paused time is excluded. It does **not** measure total asset polygons, memory, battery, thermals or native compatibility, and does not establish the original performance budgets by itself. Test on the actual target device and describe the browser/app and scenario when sharing results.

## Build targets

```sh
npm run build          # chunked web/Android-oriented Vite output in dist/
npm run build:android  # same build
npm run build:singlefile # portable single HTML output in dist-single/
npm run android:sync   # Vite build + Capacitor sync
npm run android:apk:debug # debug APK (requires JDK 21 + Android SDK)
npm test               # source-level smoke checks
```

GitHub Actions runs the locked dependency install, source smoke tests and production web build on Node 22. It skips Puppeteer's browser download; this workflow does not validate browser gameplay or Android devices. CI has not yet been observed running on GitHub. The Vite dev/preview servers allow localhost, IP addresses and `.e2b.app` preview hosts rather than arbitrary hostnames; they are development tools, not production servers.

The regular build targets ES2020, keeps assets larger than 4 KiB external, and separates Three.js/Rapier vendor chunks. The single-file build is for sharing, not the preferred mobile package because large embedded WASM/assets can inflate startup memory. `BUILD_MODE=singlefile` uses shell syntax compatible with the current Linux build environment.

## Implemented prototype systems

- Rapier initialized in a fixed-step loop; Three.js scene with batched roadside instances, traffic, a small cow herd, pooled roadside props, a three-phase Boss Bapi prototype, and animated on-road navigation chevrons.
- Drift charge tiers and release boost events, surface-grip regions, speed-sensitive steering, near-miss detection, forward-cone horn responses, destructible-prop scatter, combo counter, queued Bengali commentary badge, persistent Taka/profile data, vehicle unlocks, five purchasable upgrade tiers, liveries, daily contracts, seven mode threshold/medal panels, delivery stability / escape heat indicators, adaptive quality tiers, switchable split buttons/virtual joystick, optional drift assist and haptics, ring-buffered skid ribbons, seeded pooled spark/nitro VFX, and a 10 Hz Time Trial personal-best ghost.
- Profile schema v7 migrates v6 saves, filters saved IDs/settings to known catalog values, bounds persisted counters, and uses canonical vehicle/upgrade/contract prices rather than caller-supplied rewards. This is local single-player save validation, not server-side anti-cheat.
- Delivery, **Chand Bazaar Rescue**, and **Shapla Ghat Relay** have source-level objective slices. Delivery covers 600 m with cargo integrity, three 200 m checkpoints and a 45-second limit. Rescue collects three parcels at marked road beacons and reaches a safe drop-off within 600 m / 60 seconds; staying within the marked lane is required at each pickup. Relay attempts three visible checkpoints at 180/360/540 m, requires two active links and a 600 m finish within 75 seconds; the ±7 m lane window and remaining kit integrity affect activation/scoring. All three have automatic outcomes, cancel/retry safety, and medal rewards only for a new best. Prototype damage currently hooks to destructible-prop chaos events; comprehensive collision damage is not integrated. Source smoke tests and automated desktop straight-road browser playthroughs pass; hands-on UX and device validation remain pending.
- A dismissible Bengali/English first-drive guide explains keyboard/touch controls and Delivery's goal. It does not block driving, may be reopened in Settings, and stores only a local dismissal preference when storage is available. Its optional, bounded practice teaches steering, brake, handbrake, nitro and a marked gate; completion or skip returns the car to its prior location at rest without a mission reward. An active mission must be cancelled before starting practice.
- A small decorative roadside tea stall, tea seller and mechanic sit outside the drivable road. Optional Bengali/English tips are available in the Garage and Modes tabs; the figures are stationary and are not interactive NPCs. Visual readability, touch and localization still need playtesting and local review.
- Moving traffic and cow physics bodies follow their visible positions; an actor holds position when its predicted motion would meet the car. Vehicle translation sweeps its collider against world obstacles and can reverse away; proposed turns are checked for overlap at the start and end of movement. A bilingual status cue appears when an obstacle substantially blocks translation; it suggests changing direction or using Settings recovery. It is not impact audio or a continuous rotational collision check. A manual recovery action checks for a clear spawn and cancels an active run. Continuous rotational sweeps, moving-actor impacts and impact feedback remain incomplete.
- Garage and Settings pause simulation and mission timers; Settings → Pause provides explicit pause/resume, as does Esc on keyboard. Native lifecycle behavior still needs device testing.
- Independent keyboard, touch-button and joystick input sources prevent releasing one control from cancelling another. Focus loss, opening menus and recovery clear driving inputs; physical-device input testing is still required.
- Safe-area-aware HUD layout and Android-oriented DPR cap, with reduced antialiasing/shadows on Android user agents.

Future stage concepts—Monsoon Bypass, Green Belt Time Trial, Mela Yard Stunt Circuit, then Bapi’s Workshop—remain planning backlog, not playable content. Rescue and Relay are source-implemented and passed automated straight-road browser runs, but hands-on and device validation remain pending; stage names and cultural references still need local review. See the staged roadmap in [`MASTERPLAN.md`](MASTERPLAN.md).

These are prototype-level implementations. Collisions, vehicle handling, progression balance, mobile controls, graphics quality, and device performance require hands-on validation and tuning. Delivery, Rescue and Relay have objective/result slices with limited automated browser playthroughs; hands-on browser and device gates remain pending, and the other four modes remain incomplete prototypes. Full Pacejka simulation, boss encounter collision/mission integration, full-race replay/ghost controls, production-grade replay tooling, and Capacitor native features are not yet implemented.

## Structure

- `src/main.js` — boot, render/update loop, input, current prototype integration.
- `src/core/` — event bus, combo, profile, mode session, PB ghost.
- `src/physics/` — surface grip presets.
- `src/vehicles/` — drift tier controller.
- `src/entities/` — near-miss, props, Boss Bapi.
- `src/world/` — street construction and navigation chevrons.
- `src/audio/` — event-driven Bengali commentary and native/browser TTS bridge.
- `src/render/` — adaptive render quality and pooled VFX.
- `src/native/` — Capacitor lifecycle, haptics, preferences and TTS bridge.
- `src/ui/` — Garage, mode, touch settings.
- `tools/smoke_test.mjs` — unit-level smoke checks; not a browser/device gate.

## Build an Android APK on GitHub

The **Build Android debug APK** workflow (`.github/workflows/android-apk.yml`) is manually triggered and requires no signing secrets. Once the workflow file is present on the repository’s default branch (for example, after merging this change):

1. Open the repository on GitHub → **Actions** → **Build Android debug APK**.
2. Select **Run workflow**, choose the branch to build, and press **Run workflow**. Wait for the job to finish; inspect its logs if it fails.
3. Open the completed run and download the **bangladrive-debug-apk** artifact. GitHub provides a ZIP containing `app-debug.apk` and its SHA-256 checksum; artifacts expire after 14 days (or earlier if repository policy limits retention).
4. Extract the APK, transfer it to an Android phone running Android 7.0/API 24 or newer, and open it to install. Android may ask you to allow installation from the app used to open it; enable this only for a trusted source and turn it off afterwards. Compare the file against the included checksum if desired.

This is a **debug-signed testing build**, not a Play Store release. Each GitHub-hosted run may use a different debug signing key, so Android may refuse to update a previously installed build; uninstalling that build can erase its local game data. A stable release key and release signing need a separate, secure setup. The workflow does not establish device compatibility or complete the pending privacy, licensing, accessibility and performance gates.

## Android / Capacitor

Capacitor 8 is configured for `com.desioverdrive.bangladrift` (`webDir: dist`, HTTPS local origin). The Android project is generated and tracked; orientation is sensor-landscape, hardware acceleration is enabled, and the activity re-hides system bars with transient swipe reveal. Registered plugins: App, Status Bar, Splash Screen, Haptics, Preferences, Keep Awake, and community Text-to-Speech.

```sh
npm run android:add       # one-time platform generation, if android/ is absent
npm run android:sync      # web build + cap sync
npm run android:apk:debug # debug APK
npm run android:aab:release # release AAB; configure release signing first
npm run android:open      # open project in Android Studio
```

`android/app/src/main/assets/public/` is generated by `cap sync` and ignored by Git. Capacitor Preferences hydrates the versioned profile before the game starts and mirrors profile writes; web builds retain localStorage. Native back handling closes Garage/Settings, cancels an active prototype mode without recording a result or reward, then asks before exiting. App state resets the simulation clock and Keep Awake is released in the background. Bengali commentary is wired to native Android TTS where a matching voice is installed; browser builds use Web Speech when available, while captions remain visible. Native haptics are used on device with `navigator.vibrate` as the web fallback.

The sandbox currently has **no Java, Android SDK, or `ANDROID_HOME`**, so `android:apk:debug` and `android:aab:release` cannot be executed here. Release signing is not configured; do not ship an unsigned or debug artifact as a store build.

## Performance verification

No real-phone FPS, frame-time P95, thermal throttling, battery use, GPU memory, or JS heap measurements are claimed. Auto quality adjusts pixel ratio from rolling frame-time samples and maps tiers to shadow-map settings; no GTAO/post-processing pass exists yet. Benchmark on target phones (including at least one Adreno and one Mali device) before setting production quality defaults or promising 60 FPS. Browser smoke tests do not replace those measurements.

### Browser and touch smoke check

Start `npm run dev` in one terminal, then run `GAME_URL=http://127.0.0.1:5173/ CHROME_PATH=/path/to/chromium npm run test:browser` in another. An installed Puppeteer-compatible Chromium and its system libraries are required; omit `CHROME_PATH` to use Puppeteer's downloaded browser. The check covers desktop boot/keyboard and emulated mobile touch/menu flows, not a physical device. `GAME_URL=http://127.0.0.1:5173/ CHROME_PATH=/path/to/chromium npm run test:playthrough` runs separate automated straight-road keyboard completions, result display, retry and abort for Delivery, Rescue and Relay. `GAME_URL=http://127.0.0.1:5173/ CHROME_PATH=/path/to/chromium npm run test:practice` exercises the guide’s optional practice with keyboard and emulated touch; `npm run test:pause` checks menu, lifecycle and manual pause, and `npm run test:diagnostics` checks the opt-in performance UI using the same environment variables. These checks do not replace hands-on UX, route variety, or physical-device testing.

After `npm run build`, start `npm run preview` and run `GAME_URL=http://127.0.0.1:4173/ CHROME_PATH=/path/to/chromium npm run test:production` to check the built game's boot, driving, Rescue cancellation, debug-global exclusion and observed HTTP requests. This narrow browser check does not audit native plugins, speech providers or every gameplay path.

The built web game can continue the tested drive/Rescue cancellation and save settings after its initial assets load and the network is blocked (`npm run test:offline` against preview). It is not an offline-installable web app: in the test, an uncached reload with the origin blocked did not load the game. This does not establish complete offline support, Android behavior, speech-provider behavior, or privacy for other flows.


The locally bundled Noto Sans Bengali font is provided by `@fontsource/noto-sans-bengali` under the SIL Open Font License 1.1; its license is reproduced in `THIRD_PARTY_NOTICES/Noto-Sans-Bengali-OFL.txt`. Other project asset and dependency licensing still needs a complete audit.

## Release review

See [RELEASE_REVIEW.md](RELEASE_REVIEW.md) for the preliminary asset, direct dependency and privacy inventory and open owner/legal/device gates. It is not a legal sign-off or published privacy policy.
