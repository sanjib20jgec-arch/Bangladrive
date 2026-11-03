# AUDIT_PHASE2 — Juice / Cinematic / Director যোগ করার আগের হুক-তালিকা
**তারিখ:** ২০২৬-১১-০১ · **ভিত্তি বিল্ড:** 0.9.0 → 2.0.0 (Act 1) · **নিয়ম:** নতুন সিস্টেম পুরনো ফিচার ভাঙবে না — তাই আগে ঠিক কোথায় হাত দেব তা লিখে রাখা।

> পদ্ধতি: প্রতিটি হুকের জন্য লেখা আছে **কোথায়** (ফাইল/লাইন), **কী হুক** (ইভেন্ট বা কল), **কেন এখানেই**, আর **ঝুঁকি**। লাইন নম্বর আজকের ফাইল অনুযায়ী; কোড বাড়লে সরে যাবে, তাই ফাংশনের নামও দেওয়া আছে।

---

## ১. ফ্রেম লুপ — সময়ের একমাত্র নিয়ন্ত্রণ কেন্দ্র

| # | অবস্থান | বর্তমান | v2 হুক |
| --- | --- | --- | --- |
| H1 | `GameManager.update()` ~L520–548 | `targetScale = slowmo ? 0.4 : 1`, lerp দিয়ে `this.timeScale` | ✅ **সম্পন্ন** — `Math.min(juice.timeScale, cineSlow)`, নামার সময় snap, ওঠার সময় lerp |
| H2 | `update()` → `simDt = rawDt * timeScale` | শুধু ফিজিক্স স্কেল হয় | ✅ সঠিক — UI/অডিও `renderUpdate`-এ raw dt পায় |
| H3 | `fixedUpdate(dt)` ~L552 | gameplay ৬০ Hz | অপরিবর্তিত থাকবে; hit-stop-এর জন্য স্টেপ বাড়ানো/কমানো **নিষিদ্ধ** (ডিটারমিনিজম ভাঙে) |
| H4 | `renderUpdate(dt, alpha)` ~L985 | ভিজ্যুয়াল + ক্যামেরা | ✅ **সম্পন্ন** — `juice.update(dt)` ও `juice.applyCamera()` ক্যামেরা solve-এর **পরে** |
| H5 | `renderUpdate` শেষে `postfx.render` | এক পাস | Act 2: `PostFXStack.render()` — একই composer, পাস অন/অফ |

**ঝুঁকি:** ক্যামেরার আগে shake বসালে `lookAt()` সেটা মুছে দেয় (v1-এ এই বাগ ছিল)। তাই `applyCamera` সর্বদা `cineCamera.update()`-এর পরে।

---

## ২. ক্যামেরা

| # | অবস্থান | হুক |
| --- | --- | --- |
| C1 | `CineArcadeCamera.update()` L131–139 | ✅ `legacyShake` ফ্ল্যাগ যোগ — TraumaShake চালু থাকলে v1 random shake বন্ধ (দুই শেক একসাথে = §19 anti-pattern) |
| C2 | `CineArcadeCamera` FOV স্প্রিং L124–129 | Act 2: Dutch tilt (`camera.rotateZ(slip × 0.08)`) যোগ হবে `lookAt`-এর পরে, shake-এর **আগে** |
| C3 | `cineCamera.mode` | Act 2: `'cinematic'` মোডে CinematicDirector ক্যামেরার নিয়ন্ত্রণ নেবে (chase স্প্রিং বন্ধ) |
| C4 | `slowmo` ফিল্ড | Act 2-তে `TimeScaleStack`-এ সরানো হবে (`push('crashcam', 0.4, …)`) — দ্বিতীয় লেখক রাখা যাবে না |

---

## ৩. ইভেন্ট → juice ম্যাপিং (হুক পয়েন্ট)

| ইভেন্ট | এমিট হয় | JuiceSystem-এ | নোট |
| --- | --- | --- | --- |
| `crash` | `GameManager.emitCrash()` L712; `PoliceAI.js:315` | ✅ `onCrash` → smallHit/bigCrash/bossRam | `severity` দিয়ে প্রোফাইল বাছা |
| `nearMiss` | `GameManager.checkTrafficInteractions()` L752 | ✅ `onNearMiss` → nearMiss/ultraNearMiss | ✅ পেলোডে `minDist` যোগ করা হয়েছে (আল্ট্রা টিয়ারের জন্য অপরিহার্য) |
| `cowHit` | `GameManager` L643 | ✅ | ৪০ ms hit-stop |
| `bossCharge` | `BossBapiAI.js:81` | ✅ shake-only (hit-stop ছাড়া) | চার্জ শুরুতে ট্রমা, ধাক্কায় নয় |
| `nitroStart` | `BaseVehicleController.js:214` | ✅ | হ্যাপটিক ইগনিশন |
| `stuntRing` | `MissionManager.js:312` | ✅ | Act 3-এ Chaos-ও শুনবে |
| `magnetAttached` | `HelicopterMagnet.js` | ✅ | |
| `vehicleWrecked` | `BaseVehicleController.js:461` | ✅ bigCrash | |
| `lastSecondSave` | *(নেই — Act 2-তে ReplayBuffer বানাবে)* | ✅ হুক প্রস্তুত | ০.২৫× স্কেল, ৮০০ ms |
| `hijack`, `overtake`, `bossHit` | একাধিক | ⏭ Act 3 | Chaos-এর জন্য |

**নিয়ম:** একই ইভেন্ট দুইবার juice ট্রিগার করলে ডাবল shake হবে — তাই `JuiceSystem` ইভেন্টে সাবস্ক্রাইব করার একমাত্র জায়গা; অন্য কেউ `trauma.add` সরাসরি ডাকবে না।

---

## ৪. যানের ভিজ্যুয়াল (squash & stretch)

| # | অবস্থান | হুক |
| --- | --- | --- |
| V1 | `VehicleMeshFactory.bakeOpaque()` | ✅ প্রতিটি গাড়ির বডি এখন এক mesh, নাম `bakedShell` — squash এটিতেই হবে, পুরো `mesh` গ্রুপে নয় (নাহলে চাকা বিকৃত হয়) |
| V2 | `JuiceSystem.setVehicle()` | `enterVehicle`/`vehicleSwitch`/`exitVehicle` ইভেন্টে শেল রিজলভ |
| V3 | `BaseVehicleController.syncVisual()` | physics collider **কখনো** স্কেল হবে না — শুধু ভিজ্যুয়াল |
| V4 | Aerial গাড়ি | squash বন্ধ (হেলিকপ্টার/ড্রোন) |

---

## ৫. HUD ও UI

| # | অবস্থান | হুক |
| --- | --- | --- |
| U1 | `MobileHUD.update(dt, data)` | Act 3-এ Chaos স্কোর (NumberTicker), Momentum রিং |
| U2 | `TakaPopupManager.show()` | ✅ NumberTicker প্রস্তুত (`src/juice/NumberTicker.js`) — Act 3-এ যুক্ত হবে |
| U3 | `SubtitleBanner` | Act 4: SubtitleTypewriter (১৮ ms/অক্ষর) |
| U4 | HUD ফ্ল্যাশ | Act 1-এর ১১–১৫: `FlashSafetyLimiter` (সেকেন্ডে ≤৩ ফ্ল্যাশ, WCAG 2.3.1) |

---

## ৬. অডিও

| # | অবস্থান | হুক |
| --- | --- | --- |
| A1 | `AudioEngine.update(dt)` | ইচ্ছাকৃতভাবে **স্কেল হয় না** (hit-stop-এ সাউন্ড চলবে) |
| A2 | `EngineSynth` | hit-stop-এ পিচ ড্রপ হবে কি না — সিদ্ধান্ত: না (হুইলস্পিন ছাড়া পিচ ড্রপ অদ্ভুত শোনায়) |
| A3 | `DuckingController` (Act 5) | `subtitle` ইভেন্টে BGM −৩ dB, ইঞ্জিন −২ dB |
| A4 | AdaptiveMusic stems (Act 5) | `directorSpike`/`overdriveStart` ইভেন্ট থেকে স্টেম gain |

---

## ৭. অ্যাক্সেসিবিলিটি (Act 1-এর ১১–১৫ আগাম হুক)

| সেটিং | কোথায় পৌঁছাবে |
| --- | --- |
| `reducedMotion` | ✅ `TraumaShake.setReducedMotion` (35 %) — `settingsChanged` ইভেন্টে |
| `haptics` | ✅ `HapticsManager.setEnabled` |
| `flashLimiter` | ⏭ `FlashSafetyLimiter` (HUD/PostFX ফ্ল্যাশের একমাত্র দরজা) |
| `subtitleSize` | ⏭ `SubtitleBanner` CSS ভেরিয়েবল |
| `oneThumb` | ⏭ `MobileHUD` লেআউট ক্লাস |
| `cameraMode` (`chase`/`vlog`/`cinematic`) | ✅ `juice.applyCamera({handheld})` — vlog-এ shake ×1.4 |

সব সেটিং এক দরজা দিয়ে যায়: `GameManager.setSetting(key, value)` → `settingsChanged` ইভেন্ট।

---

## ৮. যেসব জায়গায় হাত দেওয়া **যাবে না**

1. `fixedUpdate`-এর ভেতরে `timeScale` পড়া বা লেখা — ফিজিক্স স্টেপ সবসময় ১/৬০।
2. `BaseVehicleController`-এ mesh scale লেখা (juice-এর একচেটিয়া অধিকার)।
3. `WantedSystem`/`MissionManager`-এ juice থেকে সরাসরি কল।
4. নতুন `EffectComposer` তৈরি — Act 2-তে একটাই composer, পাস অন/অফ।
5. `Math.random()` দিয়ে shake — ডিটারমিনিস্টিক value-noise ব্যবহার হবে (ReplayBuffer-এর জন্য জরুরি)।

---

## ৯. অডিটে পাওয়া নতুন ঝুঁকি ও সমাধান

| ঝুঁকি | সমাধান (এই ব্যাচে) |
| --- | --- |
| দুই শেক (v1 random + নতুন trauma) একসাথে | `CineArcadeCamera.legacyShake = false` যখন `traumaShake` চালু |
| hit-stop-এ UI/অডিও থেমে যাওয়া | juice শুধু ফিজিক্স dt স্কেল করে; `renderUpdate` raw dt পায় |
| brake-এ squash উল্টো দিকে যাওয়া | `|forwardSpeed|` ব্যবহার — গাড়ি রিভার্সে গেলে আবার stretch হয় (টেস্টে এই سلوك যাচাই করা হয়েছে) |
| low টিয়ারে ড্র-কল ৯১ (সীমা ৯০) | পরের ব্যাচে বিলবোর্ড/ল্যাম্প আরও এক ধাপ instancing |
| `node_modules` স্ন্যাপশটে থাকে না | টেস্ট চালানোর আগে `npm install` — README/টেস্ট রেসিপিতে উল্লেখ |
