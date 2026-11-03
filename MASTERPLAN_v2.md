# MASTERPLAN_v2 — DESI OVERDRIVE: BANGLA DRIFT (v2.0 "JUICE + STORY + CHAOS")
**তারিখ:** ২০২৬-১১-০১ · **ভিত্তি:** v1.0 / 0.9.0 (Phase 2 সম্পূর্ণ, স্মোক ২১/২১) · **মালিক:** Principal Game Architect

> এই ডকুমেন্ট মাস্টার প্রম্পট v2.0-এর §১৮ অনুযায়ী: (ক) v1.0-এর বর্তমান অবস্থা, (খ) নতুন সিস্টেমগুলোর **ডিপেন্ডেন্সি গ্রাফ**, (গ) কোন সিস্টেম কোন ইভেন্টে হুক করবে, (ঘ) বাজেট ও ফ্ল্যাগ। কোড লেখার আগে এটি লেখা হয়েছে; Act শেষে আপডেট হয়।

---

## ১. v1.0-এর বর্তমান অবস্থা (ভিত্তিরেখা — ভাঙা যাবে না)

| স্তর | বাস্তবায়ন | মাপা প্রমাণ |
| --- | --- | --- |
| ফিজিক্স | Rapier 60 Hz fixed step + render interpolation | ৪/৪ চাকা গ্রাউন্ডেড, y ০.৬৪–০.৬৫ |
| ত্বরণ | ৮.৫৮ m/s² (`ENGINE_UNIT 0.30`) | `tools/debug_accel.mjs` |
| যান | Arcade / Rickshaw / TwoWheeler / Aerial + Registry pool | ৫টি প্লেয়ার-যান বুটে তৈরি |
| ট্রাফিক | গ্রাফ + লেন-মার্জ (৩ সে), নোজ-টু-নোজ স্টপ | min dist ৫.৪ m |
| AI | PoliceAI (ইন্টারসেপ্ট), BossBapiAI (৬-স্টেট), Pedestrian ৪০ | প্রোব পাস |
| মিশন | ৭টি + স্টার persist `desi_overdrive_v1_stars` | প্রোব পাস |
| HUD | মিনিম্যাপ, স্পিডো, নাইট্রো/ড্রিফট/আনস্টাক, সাবটাইটেল, গ্যারেজ, ক্যারেক্টার সিলেক্ট | `shot_mobile.png` |
| পারফ | low ৮০–৯৩ · mid ১২০ ড্র-কল, ৫৭–৬২k ট্রায়াঙ্গল | `diag()` |
| বিল্ড | single-file ২.৯৫ MB / gzip ১.০৬ MB | `dist/index.html` |
| রিগ্রেশন | ২১/২১ চেক, error ০ | `tools/smoke_test.mjs` |

**v1.0-এ যা নেই (v2.0-এর কাজ):** hit-stop, time-scale stack, trauma shake (v1-এ ছিল random jitter), squash/stretch, haptics, number ticker, কাটসিন/রিপ্লে, ড্রামা ডিরেক্টর, Chaos/Momentum, ন্যারেটিভ, অ্যাডাপ্টিভ মিউজিক, শেয়ার, অ্যাক্সেসিবিলিটি সুইচ।

---

## ২. নতুন সিস্টেমের ডিপেন্ডেন্সি গ্রাফ

```
                        ┌─────────────────────────┐
                        │  EventBus (৭২+ ইভেন্ট)   │  ← একমাত্র যোগাযোগ
                        └───────────┬─────────────┘
                                    │
   GAMEPLAY (state বদলায়)          │            FEEL/PRESENTATION (state পড়ে না, শুধু প্রতিক্রিয়া)
   ─────────────────────           │            ────────────────────────────────────────────
   GameManager ──crash/nearMiss──►  │  ◄── JuiceSystem ──┬─ TimeScaleStack ──► GameManager.timeScale
   MissionManager ──stuntRing───►   │                    ├─ TraumaShake ─────► camera (post-lookAt)
   WantedSystem ──wantedUp──────►   │                    ├─ HapticsManager ──► navigator.vibrate
   BossBapiAI ──bossCharge──────►   │                    └─ squash/stretch ──► bakedShell.scale
   Traffic ──nearMiss/horn──────►   │
                                    │  ◄── CinematicDirector ── letterbox / camera path (Act 2)
                                    │  ◄── ReplayBuffer ─────── 30 Hz ring, 12 s (Act 2)
                                    │  ◄── PostFXStack/LUT ──── composer passes (Act 2)
                                    │
   DramaDirector (Act 3) ──directorSpike/Calm──► SetPieceScheduler ──► spawn requests (EventBus)
   ChaosScore (Act 3) ──chaosGain/Bank/Lost──► Momentum ──► Overdrive ──► JuiceSystem (scale floor)
   NarrativeEngine (Act 4) ──dialogue──► DialogueSystem ──► SubtitleTypewriter ──► HUD
   AdaptiveMusic (Act 5) ──barQuantized──► AudioEngine (stem gains)
   AccessibilityManager (Act 1) ──settings──► TraumaShake / PostFX / HUD
```

### নির্ভরতার দিক (কোনটা কার আগে)
| সিস্টেম | নির্ভর করে | কে নির্ভর করে তার ওপর |
| --- | --- | --- |
| `FeatureFlags` | — (কेवল data) | সব v2 সিস্টেম |
| `TimeScaleStack` | — | JuiceSystem, ReplayBuffer (slow-mo), Overdrive |
| `TraumaShake` | `save.settings.reducedMotion` | JuiceSystem, CinematicDirector |
| `JuiceSystem` | TimeScaleStack, TraumaShake, Haptics, EventBus | ChaosScore (combo popups), Overdrive |
| `ReplayBuffer` | vehicle transform API | CinematicDirector, MomentRecorder, GhostRacer |
| `CinematicDirector` | camera + ShotLibrary + ReplayBuffer | MissionManager (set-piece), DramaDirector |
| `PostFXStack/LUT` | PostFX (v1) + QualityGovernor | CinematicDirector, Overdrive, PhotoMode |
| `DramaDirector` | TensionModel + Wanted/Boss/Mission state | SetPieceScheduler |
| `ChaosScore` | JuiceSystem events | Momentum, Result cards, DailyChallenge |
| `NarrativeEngine` | MissionManager | DialogueSystem, ComicBriefing |
| `AdaptiveMusicSystem` | AudioEngine | DramaDirector (stem choice) |

**নিয়ম:** তীরের বিপরীত দিকে কখনো কল হবে না। Juice/Director কখনো gameplay state বদলাবে না (prompt §14)।

---

## ৩. অ্যাক্ট প্ল্যান ও স্টেটাস

| অ্যাক্ট | ইটারেশন | বিষয় | স্ট্যাটাস |
| --- | --- | --- | --- |
| **১** | ১–১৫ | অডিট, ফ্ল্যাগ, Juice System (hit-stop, trauma, squash, haptics, ticker), FlashLimiter, Accessibility, LocalMetrics | ✅ **সম্পূর্ণ (১–১৫)** |
| **২** | ১৬–৩০ | CineArcadeCamera আপগ্রেড, CinematicDirector, ShotLibrary, ReplayBuffer, PostFXStack/LUT | ✅ **সম্পূর্ণ (১৬–৩০)** — ক্যামেরা v2 · Director · ShotLibrary (৮ সিকোয়েন্স) · ReplayBuffer + Last Second Save · PostFXStack + LUTGrader · Director's Cut |
| **৩** | ৩১–৪৫ | DramaDirector, TensionModel, SetPieceScheduler, Chaos, Momentum/Overdrive, Ghost, RubberBand, Daily | ✅ **সম্পূর্ণ (৩১–৪৫)** — TensionModel · DramaDirector · ৮ সেট পিস · Chaos/Overdrive/Bank · RubberBand · GhostRunner · DailyChallenge · HUD chip |
| ৪ | ৪৬–৬০ | NarrativeEngine, Season 1 (৫ এপিসোড), DialogueSystem, RunningGag, ComicBriefing, EpisodeRunner, ToneGuard | ✅ **৪৬–৬০ সম্পূর্ণ** — Dialogue (৭ পুল), ৭ গ্যাগ (এস্কালেশন টিয়ার), Season 1-এর ৫ পর্ব, ComicBriefing, **EpisodeRunner** (প্লেথ্রু, ১.৬ সে গ্যাপ, ফেল = রানশেষ), **ToneGuard** (৫১ টোকেন, রানটাইম + বিল্ড-টাইম অডিট), সিজন প্যানেল, র‍্যাপার ভয়েস হুক, Chaos/Director ব্যালান্স পুনঃটিউন |
| ৫ | ৬১–৭৫ | রিকশা ফিজিক্স, Episode 2 (বিরিয়ানি স্লশ), AdaptiveMusic (৯ স্টেম), Photo/Share | ✅ **সম্পূর্ণ** — রিকশা টিপ FSM + রকেট সম্পদ, CargoSlosh + HUD মিটার, Episode 2 ডেটা/মিশন, স্পিডি বৌদি ৬-স্টেট ধাওয়া + হাঁড়ি চুরি/ফেরত, শট-লিস্ট + ৯ অডিও কিউ, ৯-স্টেম AdaptiveMusicSystem, PhotoMode, ShareCard (১০৮০×১৩৫০), PlaytestAnalytics (৩২×৩২ হিট-ম্যাপ, ফানেল, লোকাল-অনলি) |
| **৬** | ৭৬–১০০ | Final DoD, বাজেট পাস, Craft/Fame ইভেন্ট, রিলিজ-গেট | ✅ **সম্পূর্ণ** — peds ২৫/১০ · স্টেম ৪/৩/২ (identity-first) · `simScale`+`rampSimScale` · `CraftSystem` · `FameSystem` · trauma clamp · `tools/final_dod.mjs` **15/15** · রিগ্রেশন ৩১২/৩১২ |

---

## ৪. নতুন পারফরম্যান্স বাজেট (prompt §13) — বর্তমান মাপ

| সিস্টেম | High | Mid | Low | আজকের মাপা |
| --- | --- | --- | --- | --- |
| FPS | ৬০ | ৬০ | ৬০ | হেডলেসে অজ্ঞেয় (সিম-টাইমে যাচাই) |
| Draw calls | ≤২২০ | ≤১৫০ | ≤৯০ | **low ৬৭** ✅ / mid ১২০–১২৫ ✅ (পেট্রল-স্টেশন মার্জের পর) |
| Particle | ৩০০ | ১৫০ | ৬০ | পুল প্রস্তুত |
| Ring buffer | ৩০ Hz | ৩০ Hz | ১৫ Hz | **✅ ৩০/৩০/১৫, ১২ সে, ৩৮.৯ KB `Float32Array`** |
| PostFX পাস | ১ | ১ | ০ (CSS fallback) | **✅ যাচাই করা** |
| Audio stems | ৪ | ৩ | ২ | **✅ ৪/৩/২ enforced (identity-first)** |
| Traffic | ৬০ | ৪০ | ২০ | ✅ |
| Pedestrian | ৪০ | ২৫ | ১০ | **✅ ৪০/২৫/১০ (Act 6-এ নামানো)** |
| JS heap | ≤৩৫০ MB | ≤২৫০ MB | ≤২০০ MB | **✅ ২৩.৯ MB** |

**খোলা কাজ:** Snapdragon 680-এ আসল FPS প্রোফাইল (হেডলেসে মাপা যায় না) — একমাত্র বাকি লাইন। low টিয়ার ৬৭ ড্র-কল, বাজেটের অনেক নিচে।

---

## ৫. ফিচার ফ্ল্যাগ (prompt §14) — `src/data/features.json`

| ফ্ল্যাগ | ডিফল্ট | কী নিয়ন্ত্রণ করে |
| --- | --- | --- |
| `juice` | ✅ on | সম্পূর্ণ JuiceSystem (মাস্টার সুইচ) |
| `hitStop` | ✅ on | hit-stop ও slow-mo এন্ট্রি |
| `traumaShake` | ✅ on | ক্যামেরা শেক (v1-এর random shake বন্ধ হয়) |
| `haptics` | ✅ on | ভাইব্রেশন |
| `squashStretch` | ✅ on | গাড়ির বডি স্কেল |
| `numberTicker` | ✅ on | সংখ্যা গণনা (Act 3-এ ব্যবহৃত) |
| `cinematic` / `replay` / `director` / `chaos` / `setpieces` | ✅ on | Act 2–3-এ চালু ও টেস্ট করা |
| `narrative` / `adaptiveMusic` / `photoMode` / `share` | ⛔ off | Act 4–5 |

রানটাইমে: `DESI_API.flag('juice', false)` → সাথে সাথে বন্ধ, localStorage-এ মনে থাকে।

---

## ৬. ইভেন্ট চুক্তি (v2, prompt §14)

নতুন ইভেন্ট: `hitStop`, `traumaAdd`, `timeScalePushed`, `timeScaleExpired`, `chaosGain`, `chaosBank`, `chaosLost`, `momentumFull`, `overdriveStart`, `overdriveEnd`, `directorSpike`, `directorCalm`, `setPieceStart`, `setPieceEnd`, `replayTrigger`, `gagIncrement`, `fameChanged`, `craftSuccess`, `craftFail`, `photoOpen`, `shareRequest`, `lastSecondSave`, `featureChanged`, `settingsChanged`, `hapticPulse`।

Act 6-এ সব ২০টি বাধ্যতামূলক ইভেন্টের emitter আছে (DoD সারি ৩)। প্রথমে বাস্তবায়িত হয়েছিল: `hitStop`, `traumaAdd`, `timeScalePushed`, `timeScaleExpired`, `hapticPulse`, `featureChanged`, `settingsChanged`।

---

## ৭. সেভ স্কিমা v2 (prompt §14)
`desi_overdrive_v2_*` কী, `schemaVersion: 2`, প্রতি ফিল্ড ভ্যালিডেশন, করাপ্ট হলে ডিফল্ট (ক্র্যাশ নয়)।
v1 কী (`v1_stars`, `v1_profile`, `v1_settings`) থেকে **মাইগ্রেশন**: স্টার ও প্রোফাইল কপি হবে, তারপর v1 অক্ষত থাকবে (রোলব্যাকের জন্য)। → Act 3-এ বাস্তবায়ন।

---

## ৮. রিস্ক ও প্রশমন

| ঝুঁকি | প্রশমন |
| --- | --- |
| Juice over-use (prompt §19) | প্রতি ইভেন্টে একটাই প্রোফাইল, hit-stop ≤১২০ ms, একসাথে shake+slow একই ইভেন্টে শুধু প্রোফাইলে থাকলে |
| Slow-mo বাগ | শুধু TimeScaleStack, প্রতিটি এন্ট্রির নিজের মেয়াদ |
| রিপ্লে মেমরি | ফিক্সড `Float32Array`, ৩০ Hz × ১২ সে (Act 2) |
| Flash safety | FlashSafetyLimiter (Act 1-এর ১১–১৫) — WCAG 2.3.1 |
| mid-range ফোনে রিগ্রেশন | QualityGovernor-এ নতুন সিস্টেমের ms বাজেট, ফ্ল্যাগ দিয়ে তাৎক্ষণিক বন্ধ |

---

## ৯. রেফারেন্স (prompt §17)
- Squirrel Eiserloh, *Math for Game Programmers: Juicing Your Cameras With Math*, GDC 2016 — trauma² মডেল, decay, smooth noise।
- Jan Willem Nijman, *The Art of Screenshake* (Vlambeer) — "a good hit is a stack of small reactions"।
- W3C, *Understanding SC 2.3.1: Three Flashes or Below Threshold* — ফ্ল্যাশ লিমিটার।
- MDN: Vibration API, Pointer Events, MediaRecorder, canvas.captureStream, Web Share API।
- Three.js docs: EffectComposer, UnrealBloomPass, OutputPass, SMAAPass, LUTPass, InstancedMesh।

---

## ৯. রিলিজ-গেট (Act 6)

`node tools/final_dod.mjs` → **15/15** (কাঁচা: `tools/final_dod_report.json`), সারি-ধরে প্রমাণ `FINAL_DOD.md`, ৭টি খোলা প্রশ্ন `ACT6_REVIEW.md`।
