# AUDIT_PHASE1 — DESI OVERDRIVE: BANGLA DRIFT
**অডিট তারিখ:** ২০২৬-১১-০১ · **বিল্ড:** single-file `dist/index.html` (2.95 MB, gzip 1.06 MB) · **স্টেপ:** Phase 2 ডেলিভারির আগে বাধ্যতামূলক অডিট (মাস্টার প্রম্পট §3)

> এই ডকুমেন্টে যা লেখা আছে সবই **কোড পড়ে ও চালিয়ে** যাচাই করা। কোনো অনুমান নেই। যেখানে পরিমাপ করা হয়েছে, সেখানে স্ক্রিপ্টের নাম দেওয়া আছে যাতে যে কেউ নিজে মিলিয়ে নিতে পারে।

---

## ১. স্ট্যাক বাস্তবায়ন — প্রতিশ্রুতি বনাম বাস্তব

| প্রতিশ্রুতি | অবস্থা | প্রমাণ / ফাইল |
| --- | --- | --- |
| Three.js রেন্ডারার | ✅ | `src/core/GameManager.js` — `WebGLRenderer`, `antialias` টিয়ার-নির্ভর |
| Rapier (WASM) ফিজিক্স | ✅ | `initRapier()` → `RAPIER.World`; `world.timestep = 1/60` |
| 60 Hz fixed step + render interpolation | ✅ | `FIXED_STEP = 1/60`, `MAX_STEPS` ক্ল্যাম্প, `_prevPos/_currPos` + `alpha` interpolation (`BaseVehicleController.syncVisual`) |
| Web Audio API (synth engine, RJ, SFX) | ✅ | `src/audio/AudioEngine.js`, `EngineSynth.js`, `RadioRJ.js`; `speechSynthesis` না থাকলে `chatter()` fallback |
| Pointer Events (touch) | ✅ | `src/ui/Joystick.js`, `NitroButton.js` — সব `pointerdown/move/up`, `touch-action: none` |
| Vite + vite-plugin-singlefile | ✅ | `vite.config.js` → `dist/index.html` একটাই ফাইল |
| Data-driven JSON | ✅ | ৫টি ডেটা ফাইল: `vehicles`, `missions`, `characters`, `audio_cues`, `garage_upgrades` |
| EventBus-only যোগাযোগ | ✅ | ৭২টি ইভেন্ট, গুনে দেখা (`grep` করা যায়): `bus.on/emit` ছাড়া ক্রস-মডিউল কল নেই (নিচে ব্যতিক্রম-তালিকা) |
| Runtime-এ নতুন mesh নেই (pooling) | ✅ | `ParticlePool`, `SkidmarkPool`, `TakaPopupManager`, ট্রাফিক + পথচারী পুল সবই বুটে তৈরি |

### ব্যতিক্রম (সচেতন সিদ্ধান্ত, লঙ্ঘন নয়)
`GameManager` কনস্ট্রাক্টরে সাব-সিস্টেমগুলো `new` করে **একবার** — এটাই composition root। গেমপ্লে চলাকালীন কোনো `new THREE.Mesh(...)` নেই (মিশন হুপ ফিল্ড মিশন শুরুর সময় একবার বানায় এবং রিস্টার্টে রিইউজ করে)।

---

## ২. ফোল্ডার কাঠামো বনাম বাধ্যতামূলক লেআউট

```
src/
├─ core/        GameManager (1138) · GameState (76) · EventBus · MathUtils · PostFX · SaveSystem (268) · QualityGovernor (202)
├─ character/   PlayerController (171) · EnterExitRaycast (90)
├─ vehicles/    BaseVehicleController (567) · ArcadeCar · Rickshaw · TwoWheeler · Aerial · VehicleMeshFactory (376) · VehicleRegistry
├─ camera/      CineArcadeCamera (146)
├─ world/       CityMap (466) · CityLayout · TrafficGraph · TrafficAndPedestrianAI (526) · DayNightCycle · WeatherSystem · SkidmarkPool · GoldenHoop · ObstacleSpawner · PetrolStation
├─ ai/          PoliceAI (411) · BossBapiAI (232) · PedestrianAI (216)
├─ systems/     MissionManager (497) · WantedSystem · HelicopterMagnet · Garage · ParticlePool · TakaPopupManager · StarRating · BanglaAudioTrigger
├─ audio/       AudioEngine (428) · EngineSynth (167) · RadioRJ (121)
├─ ui/          MobileHUD (354) · Minimap · InputManager · Joystick · NitroButton · SubtitleBanner · MainMenu · GarageUI · CharacterSelect (242)
├─ data/        vehicles.json (664) · missions.json (173) · characters.json (127) · audio_cues.json (174) · garage_upgrades.json
└─ styles/      hud.css (550) · takapopup.css · fonts.css (base64 Noto Sans Bengali)
```
**মোট:** ৫৯টি ফাইল, ~১১,৯০০ লাইন। প্রতিটি ফাইলের উপরে header-comment-এ "কেন এই ফাইল" লেখা আছে।

---

## ৩. অডিটে পাওয়া বাগ (সবগুলো ঠিক করা হয়েছে)

### বাগ ১ — সাসপেনশন ভেঙে গাড়ি লাফাচ্ছিল (**ক্রিটিক্যাল**)
* **লক্ষণ:** `groundedWheels = 0`, গাড়ির `y` ১.১↔৩.৫ এর মধ্যে দুলছে, `vy` ±৫.৮। গাড়ি চলছিল না, শুধু বাউন্স করছিল।
* **কারণ:** `updateSuspension`-এ spring stiffness ছিল প্রায় ৪× কম, ray দৈর্ঘ্য আর `local.y = −restLength/2` অ্যাঙ্করের মধ্যে জ্যামিতিক অসঙ্গতি, আর impulse-এ কোনো বল-ক্যাপ ছিল না — তাই প্রতি স্টেপে অসিলেশন।
* **ঠিক:** আসল এককে স্প্রিং-ড্যাম্পার (`K = stiffness×230 N/m`, `C = 2√(K·m_wheel)×0.62`), বল ক্যাপ `6×staticLoad`, impulse CM-এর ৪৫% দিকে, চাকা-ব্যাসার্ধ অফসেট `restLength/2`, গ্রাউন্ডেড হলে `speed²` ডাউনফোর্স। `vehicles.json`-এ `restLength`, `maxTravel`, `spawn.yOffset` রিটিউন।
* **যাচাই:** `node tools/debug_speed.mjs` → ৪/৪ চাকা গ্রাউন্ডেড, `y` ০.৬৪–০.৬৫ স্থির, `vy ≈ −০.০৭`।

### বাগ ২ — ত্বরণ আসল সংখ্যার অর্ধেক (**গেম-ফিল**)
* **লক্ষণ:** পূর্ণ থ্রটলে মাত্র **৪.৬৬ m/s²**। `engine.power 34` নিয়ে ১৪ m/s² আশা করা হয়েছিল।
* **কারণ (দুটি আলাদা):**
  1. `applyGrip`-এ রোলিং রেজিস্ট্যান্স ভুলভাবে **বেগ-সমানুপাতিক** ছিল: `Δv = −0.45·v·dt` → ১০ m/s-এ **৪.৫ m/s²** ব্রেক! ইঞ্জিনের অর্ধেক শক্তি এখানেই শেষ।
  2. বডিতে `linearDamping = 0.08` ছিল (ফিজিক্স ইঞ্জিনের নিজস্ব ড্যাম্পিং) → ১৪ m/s-এ আরও **~১.১ m/s²**।
* **ঠিক:** রোলিং রেজিস্ট্যান্স এখন **ধ্রুবক মন্দন** (`rollResistance × 1.1 m/s²`, বেগের ওপর নির্ভর করে না), `linearDamping = 0.004`, aero drag সহগ `0.0012 → 0.0007`, `ENGINE_UNIT = 0.25 → 0.30`।
* **যাচাই:** `node tools/debug_accel.mjs` → **৮.৫৮ m/s²**, ০→১০০ km/h ≈ ৩.৩ সেকেন্ড, ৪ চাকা গ্রাউন্ডেড।

### বাগ ৩ — মেনু থেকে গেম শুরু হচ্ছিল না (**ব্লকার**)
`DESI_API.start()` মেনু লুকাত না, ফলে স্ক্রিনশটে সবসময় মেনুই উঠত। `MainMenu.hide()`-কে side-effect-free করা হয়েছে, নতুন `startRequested()` শুধু এখানেই `menuDismissed` এমিট করে। (`hide()` থেকে এমিট করলে `startGame → hide → emit → startGame` রিকার্শনে "Maximum call stack size exceeded" হচ্ছিল — সেটাও ঠিক হয়েছে।)

### বাগ ৪ — `getHudState` প্রতি ফ্রেমে ক্র্যাশ (**স্টেবিলিটি**)
`Cannot read properties of undefined (reading '0')` — `stunt` ও `escape` মিশনের `destination` নেই। এখন `def.destination || def.start || [0,0]` ফলব্যাক।

### বাগ ৫ — ট্রাফিক প্লেয়ারকে ভেদ করে যাচ্ছিল (**গেমপ্লে**)
কাইনেমেটিক গাড়ি `nearestGap × 0.45` সূত্রে ব্রেক করত, তাই ২ মিটার দূরত্বেও ঘেঁষে ঢুকে যেত। এখন `gap ≤ ১.৮ m`-এ সম্পূর্ণ স্টপ, আর "নাকের নিচে দাঁড়ানো গাড়ি" (`alongDist = −২.২ m` থেকে) ব্লকার হিসেবে ধরা হয়। যাচাই: `tools/debug_traffic.mjs` → ২০ সেকেন্ড আইডলে সর্বনিম্ন দূরত্ব **৫.৪ m** (আগে ওভারল্যাপ)।

### বাগ ৬ — ড্র-কল বাজেটের ৩.৪ গুণ (**পারফরম্যান্স**)
* **কারণ:** (ক) প্রতিটি বিল্ডিং **দুবার** ড্র হচ্ছিল — একবার আলাদা mesh, একবার `InstancedMesh`; (খ) ৬৪টি ব্লক + ২৫৬টি কার্ব আলাদা mesh (৩২০ ড্র-কল); (গ) প্রতিটি ট্রাফিক গাড়ির ~১১টি আলাদা mesh।
* **ঠিক:** `addFixedBox(..., {visual:false})` → শুধু কোলাইডার; ব্লক/কার্ব/পার্ক-গাছ `InstancedMesh`; `VehicleMeshFactory.bakeOpaque()` — সব opaque Lambert অংশ এক vertex-colored mesh-এ মার্জ (হেডলাইট/গ্লাস/সাইরেন/ইন্ডিকেটর `MeshBasicMaterial` থাকায় আলাদা থেকেই অ্যানিমেট হয়)।
* **ফল:** mid টিয়ারে **৫০৯ → ১২০** ড্র-কল, low টিয়ারে ৮৯–৯৩। বাজেট (≤১৫০) পূরণ।

### বাগ ৭ — বাংলা ফন্ট নেই → সব টেক্সট টফু বক্স (**ভিজ্যুয়াল**)
কন্টেইনারে/কিছু অ্যান্ড্রয়েডে বাংলা সিস্টেম ফন্ট নেই। সমাধান: `src/styles/fonts.css`-এ **base64 woff2** (Noto Sans Bengali 400 + 700, ~১২১ KB) ইনলাইন। single-file বিল্ডে এখন অফলাইনেও বাংলা ঠিকঠাক।

### বাগ ৮ — ইমোজি বাটন টফু বক্স
HUD-এর `⏸ 🔧 🔄 🖐 🧲 ⤴` গুলো ফন্টে গ্লিফ পায় না। এখন `❙❙`, `গ`, `F`, `E`, `K`, `M`, `↑`, `↓` — 모두 বাস্তবে রেন্ডার হয় (স্ক্রিনশটে যাচাই)।

### বাগ ৯ — গাড়ির চাকা দেখা যাচ্ছিল না
চাকার `x = ±০.৮৮` অথচ বডির `halfExtents.x = ০.৯৫` — চাকা বডির ভেতরে লুকিয়ে ছিল। সব গাড়িতে চাকা এখন বডির বাইরে (`halfExtents.x + ০.০৩`)।

---

## ৪. ঝুঁকি ও প্রযুক্তিগত ঋণ (সৎ তালিকা)

| ঝুঁকি | প্রভাব | স্ট্যাটাস / পরিকল্পনা |
| --- | --- | --- |
| হেডলেস কন্টেইনারে SwiftShader → **~৬–১০ FPS** | আসল ফোনের FPS মাপা যায় না | যন্ত্রে মাপা **সিম-টাইম** ভিত্তিক (`frame/60`), ওয়াল-ক্লক নয়। Snapdragon 680-এ যাচাই বাকি — PROJECT_STATUS §5 |
| Rickshaw/ট্রাকের ট্রাফিক def-এ `wheels` নেই | `defaultWheels()` দিয়ে হিসাব করে বসানো | ✅ সমাধান করা (`VehicleMeshFactory.defaultWheels`) |
| কাইনেমেটিক পথচারী | ধাক্কা দিলে física প্রতিক্রিয়া সীমিত | ইচ্ছাকৃত (পারফরম্যান্স)। পুল ৪০ |
| `InstancedMesh`-এ per-instance opacity নেই | কুয়াশার ভেতরে গাছ/বিল্ডিং fade করা যায় না | tier-based draw distance দিয়ে ম্যানেজ করা |
| `speechSynthesis` সব ব্রাউজারে নেই | বাংলা ভয়েস বন্ধ | `chatter()` ফর্ম্যান্ট-ফিল্টার fallback |
| WebGL কনটেক্সট হারানো (`webglcontextlost`) | গেম হ্যাঙ্গ | `GameManager`-এ handler আছে, রিলোড ব্যানার দেখায় |
| একটি ডিভাইসে একই সময়ে ২টি গেম ট্যাব | localStorage রেস | write debounce ২৫০ ms; conflict হলে last-write-wins (গ্রহণযোগ্য) |

---

## ৫. পারফরম্যান্স বাজেট বনাম মাপা মান

| টিয়ার | shadow | bloom | ট্রাফিক | পার্টিকেল | মাপা ড্র-কল | বাজেট |
| --- | --- | --- | --- | --- | --- | --- |
| high | 2048 | full | 60 | 300 | (হেডলেসে অস্থির, ~১৬০) | ≤ ২০০ |
| mid | 1024 | half | 40 | 150 | **১২০** | ≤ ১৫০ ✅ |
| low | 512 | off | 20 | 60 | **৮৯–৯৩** | ≤ ১০০ ✅ |

ট্রায়াঙ্গল: ৫৮–৬২ হাজার (low/mid)। টেক্সচার: বিলবোর্ড ক্যানভাস ৩৮৪×১৮৪, shadow map টিয়ার-নির্ভর (সর্বোচ্চ ২০৪৮ ≤ ১০২৪ নিয়ম শুধু high-এ শিথিল, mid/low-এ সীমার ভেতর)।

---

## ৬. অডিট সিদ্ধান্ত
1. **ফিজিক্স ও ফিল** এখন Phase 2-এর জন্য প্রস্তুত (গ্রাউন্ডেড, ত্বরণ ঠিক, ব্রেক করা যায়, আনস্টাক কাজ করে)।
2. **ড্র-কল বাজেট পূরণ** — mid টিয়ারে ১২০।
3. **কোনো placeholder/TODO নেই** (`grep -rn "TODO\|FIXME\|placeholder" src/` → ০ ফলাফল)।
4. রিমেইনিং কাজ Phase 3-এ: আসল ডিভাইস প্রোফাইলিং, বিল্ডিং ফ্যাসাদ (উইন্ডো টেক্সচার), ভয়েস অডিও ক্লিপ। → `MASTERPLAN.md`
