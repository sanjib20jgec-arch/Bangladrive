# MASTERPLAN — DESI OVERDRIVE: BANGLA DRIFT

> ⚠️ **v2.0 শুরু হয়েছে।** Juice/Cinematic/Director-এর নতুন প্ল্যান, ডিপেন্ডেন্সি গ্রাফ ও বাজেট এখন **`MASTERPLAN_v2.md`**-এ। এই ফাইলটি v1.0 ভিত্তির রেকর্ড হিসেবে অপরিবর্তিত রাখা হলো।
**সংস্করণ:** 0.9 (Phase 2 ক্লোজ) · **আপডেট:** ২০২৬-১১-০১ · **মালিক:** Principal Game Architect

> এই প্ল্যান মাস্টার প্রম্পটের §9.1 অনুযায়ী কোডিংয়ের **আগে** তৈরি হয়েছিল এবং প্রতিটি ব্যাচের শেষে আপডেট হয়। নিচে যা "✅" তা আজকের বিল্ডে চালিয়ে দেখা — প্রতিটির টেস্ট-রেসিপি `PROJECT_STATUS.md`-এ।

---

## ১. ভিশন ও অনুভূতি (Feel Pillars)

1. **Asphalt 9 গতি** — ত্বরণ ৮.৫ m/s², ০→১০০ ≈ ৩.৩ সে, নাইট্রোতে FOV ৬০→৭৫°, স্ক্রিন-ব্লার, স্পিডলাইন।
2. **GTA ওপেন ওয়ার্ল্ড** — পাড়ার গ্রিড শহর, ট্রাফিক, গরু, হেলিকপ্টার, ৭ ধরনের মিশন, Wanted সিস্টেম।
3. **কমেডি টোন** — সব সাবটাইটেল বাংলায়, RJ, গালি নয় — খোঁচা; ধর্ম/রাজনীতি ছোঁয়া নিষিদ্ধ।
4. **এক হাতেই খেলা যায়** — landscape, জয়স্টিক + NITRO + DRIFT, ≥৪৮ dp বাটন, safe-area।

---

## ২. ধাপ (Phases) ও ডেলিভারেবল

| ধাপ | লক্ষ্য | অবস্থা |
| --- | --- | --- |
| **P0** | স্ট্যাক দাঁড় করানো: Three.js + Rapier + Vite singlefile | ✅ |
| **P1** | একক গাড়ি + শহর + ক্যামেরা + ফিল | ✅ |
| **P2** | ট্রাফিক AI, মিশন ৭টি, চ্যারেক্টার ৪+Boss, পুলিশ, হেলিকপ্টার, ২০টি ইম্প্রুভমেন্ট সাইকেল | ✅ (এই ডেলিভারি) |
| **P3** | আসল ফোনে প্রোফাইলিং, ফ্যাসাদ/টেক্সচার আর্ট, বাংলা ভয়েস ক্লিপ, Capacitor প্যাকেজিং | ⏭ পরবর্তী |
| **P4** | লাইভ-অপস (daily challenge, ghost replay), স্টোর বিল্ড | ⏭ |

---

## ৩. ফিচার ম্যাট্রিক্স (মাস্টার প্রম্পটের প্রতিটি দাবি)

### ৩.১ কোর আর্কিটেকচার
- **EventBus-only:** ৭২টি ইভেন্ট; সাব-সিস্টেম কেউ কাউকে সরাসরি ডাকে না।
- **States:** `MENU → FREE_ROAM ⇄ IN_MISSION ⇄ GARAGE ⇄ CUTSCENE ⇄ PAUSED` ✅ (`GameState.js`, অনুমোদিত ট্রানজিশন টেবিল সহ)
- **Fixed timestep:** ৬০ Hz ফিজিক্স/AI/মিশন, রেন্ডার interpolation (`alpha`) ✅
- **Pooling:** `ParticlePool`, `SkidmarkPool`, `TakaPopupManager`, ট্রাফিক ৬০, পথচারী ৪০, পুলিশ ইউনিট, হুপ ৫ — সবই বুট-টাইমে ✅
- **Data-driven:** গাড়ির স্পেক, মিশন, চ্যারেক্টার, অডিও কিউ, আপগ্রেড — সব JSON-এ ✅

### ৩.২ Phase 2 ফিচার
| ফিচার | বাস্তবায়ন | যাচাই |
| --- | --- | --- |
| ট্রাফিক গ্রাফ + লেন-মার্জ (৩ সে anti-jitter) | `TrafficGraph.js`, `mergeCooldown = 3 s` | `lane merge logic ran` ✅ |
| গরু/ষাঁড় বিপদ | `TrafficAndPedestrianAI` + `cowHit` ইভেন্ট, `stats.cowsHit` | চালিয়ে দেখা ✅ |
| Wanted "পাড়া চ্যাপ" ০–৫, heat rise/decay | `WantedSystem.js` | `wanted level spawns police` ✅ |
| PoliceAI প্রেডিক্টিভ ইন্টারসেপ্ট | `ai/PoliceAI.js` (লিড-টার্গেট পয়েন্ট) | ✅ |
| ৭ ধরনের মিশন + স্টার persist (`desi_overdrive_v1_stars`) | `systems/MissionManager.js`, `SaveSystem` | `stars persist` ✅ |
| ৪টি চ্যারেক্টার + Boss Bulldozer Bapi (৬-স্টেট FSM) | `characters.json` + `ai/BossBapiAI.js` | `boss reached an aggressive state` ✅ |
| হেলিকপ্টার ম্যাগনেট (damping ratio ~0.7, clamped vy, soft release) | `systems/HelicopterMagnet.js` | `magnet captures a car` ✅ |

### ৩.৩ ২০টি ইম্প্রুভমেন্ট সাইকেল
| # | সাইকেল | অবস্থা | প্রমাণ |
| --- | --- | --- | --- |
| 1 | টাচ লেটেন্সি ≤ ১ ফ্রেম | ✅ | `InputManager.latencyProbe`, pointer → sample একই ফ্রেমে |
| 2 | FOV ৬০→৭৫° @৮৩ m/s, নাইট্রোতে +৮° | ✅ | `fov: 60.68 → 68.28` |
| 3 | কোয়ালিটি টিয়ার + হিস্টেরেসিস | ✅ | `QualityGovernor` (৪৭/৫৮ FPS থ্রেশহোল্ড) |
| 4 | স্লিপস্ট্রিম (ড্রাফটিং বুস্ট) | ✅ | `slipstream` ইভেন্ট |
| 5 | নাইট্রো পিচ +৮–১৫% | ✅ | `EngineSynth` |
| 6 | টাকা পপআপ | ✅ | `TakaPopupManager` (পুলড) |
| 7 | রিফুয়েল ১০ সে কুলডাউন | ✅ | `PetrolStation`, `refuel` ইভেন্ট |
| 8 | বৃষ্টির রিপল ≤২০০ | ✅ | `WeatherSystem`, টিয়ারভেদে ২০০/১৪০/৭০ |
| 9 | স্কিডমার্ক ≤৪০০ সেগমেন্ট / ৬ সে ফেড | ✅ | `SkidmarkPool` |
| 10 | গ্যারেজ লাইভ স্ট্যাট | ✅ | `GarageUI` + `Garage` |
| 11 | `[R]` ফ্লিপ-আনস্টাক | ✅ | `resetUpright()` → `unstuck rights the car` ✅ |
| 12 | দিন/রাত সাইকেল | ✅ | `day/night changes sky` ✅ |
| 13 | RJ shuffle-bag | ✅ | `RJ bag avoids repeats` ✅ |
| 14 | হুপ রেডিয়াস +১৫–২০% swept detection | ✅ | `hoop swept test registers a hit` ✅ |
| 15 | মিনিম্যাপ z-অর্ডার | ✅ | `Minimap.js`, `.hud-minimap` layer |
| 16 | মিনিফায়েড single-file | ✅ | ২.৯৫ MB / gzip ১.০৬ MB |
| 17 | চ্যারেক্টার সিলেক্ট (৪ জন) + persist | ✅ **(নতুন)** | `CharacterSelect.js`, `profile.character` |
| 18 | ট্রাফিক নোজ-টু-নোজ স্টপ (প্লেয়ার ভেদ রোধ) | ✅ **(নতুন)** | `debug_traffic.mjs`: min dist ৫.৪ m |
| 19 | ড্র-কল ৫০৯ → ১২০ (instancing + mesh bake) | ✅ **(নতুন)** | `diag().drawCalls = 120` |
| 20 | HUD গ্লিফ/ফন্ট অডিট (কোনো টফু নয়) | ✅ **(নতুন)** | `shot_mobile.png` |

---

## ৪. পারফরম্যান্স বাজেট (অপরিবর্তিত প্রতিশ্রুতি)

| টিয়ার | টার্গেট FPS | shadow | bloom | ট্রাফিক | পার্টিকেল | ড্র-কল সিলিং |
| --- | --- | --- | --- | --- | --- | --- |
| High | ৬০ | 2048 | full | 60 | 300 | ≤ ২০০ |
| Mid | ৬০ | 1024 | half | 40 | 150 | ≤ ১৫০ (মাপা ১২০) |
| Low | ৫০+ | 512 | off | 20 | 60 | ≤ ১০০ (মাপা ৮৯) |

টেক্সচার ≤ ১০২৪ (shadow বাদে), Snapdragon 680 @৬০ FPS = **P3-এর শর্ত**, হেডলেসে মাপা যায় না।

---

## ৫. ১০০-ইটারেশন লুপ — স্টেটাস

`Analyze → Think → Fix → Improve` ব্যাচ হিসেবে চলছে; প্রতিটি ব্যাচের রেকর্ড `CHANGELOG.md`-এ।

| ব্যাচ | ইটারেশন | ফোকাস | অবস্থা |
| --- | --- | --- | --- |
| B1 | 1–10 | বুট, রেন্ডার, ইনপুট, HUD ভিত্তি | ✅ |
| B2 | 11–20 | ফিজিক্স, সাসপেনশন, ক্যামেরা, শহর | ✅ |
| B3 | 21–30 | ট্রাফিক, গরু, Wanted, পুলিশ | ✅ |
| B4 | 31–40 | ৭ মিশন, স্টার persist, হুপ | ✅ |
| B5 | 41–50 | Boss FSM, হেলিকপ্টার ম্যাগনেট | ✅ |
| B6 | 51–60 | অডিও, RJ, বাংলা সাবটাইটেল, ফন্ট | ✅ |
| B7 | 61–70 | কোয়ালিটি টিয়ার, পার্টিকেল, স্কিড, বৃষ্টি | ✅ |
| B8 | 71–80 | গ্যারেজ, আপগ্রেড, ক্যারেক্টার সিলেক্ট | ✅ |
| B9 | 81–90 | পারফরম্যান্স: instancing, mesh bake, ড্র-কল | ✅ |
| B10 | 91–100 | QA: স্মোক ২১/২১, মোবাইল HUD, ডকুমেন্টেশন | ✅ |

---

## ৬. ঝুঁকি ও ব্যবস্থা

| ঝুঁকি | ব্যবস্থা |
| --- | --- |
| mid-range ফোনে ফ্রেম ড্রপ | টিয়ার হিস্টেরেসিস + ট্রাফিক বাজেট ৬০/৪০/২০ |
| বাংলা ফন্ট না থাকা | base64 woff2 ইনলাইন (fonts.css) |
| localStorage ব্লক (private mode) | `SaveSystem.safeGet/safeSet` — গেম ক্র্যাশ করে না, শুধু সেভ হয় না |
| ফিজিক্স বিস্ফোরণ (খারাপ dt) | accumulator clamp + `MAX_STEPS` |
| মোবাইলে হিট-টার্গেট ছোট | সব বাটন `min-height: 48px`, safe-area inset |

---

## ৭. পরবর্তী ধাপ (P3 — অনুমোদনের পরে)
1. Snapdragon 680 / Redmi ডিভাইসে `chrome://tracing` + `diag()` প্রোফাইল; টিয়ার থ্রেশহোল্ড ক্যালিব্রেট।
2. বিল্ডিং ফ্যাসাদ: এক ৫১২×৫১২ অ্যাটলাস টেক্সচার + instanced UV-Variation (draw call না বাড়িয়ে)।
3. বাংলা ভয়েস: ৩২টি লাইন OGG-এ বেক করে `audio_cues.json`-এ ম্যাপ।
4. Capacitor `android/` স্ক্যাফোল্ড, TWA manifest, APK সাইন।
5. গেমপ্যাড + কিবোর্ড রিম্যাপ UI।
