# PROJECT_STATUS — DESI OVERDRIVE: BANGLA DRIFT
**সংস্করণ:** 5.0.0 + lookdev 0.1.0 · **তারিখ:** ২০২৬-১১-০৩ · **ধাপ:** v5.0 «NEXT-GEN AAA» — ৫ পিলার সম্পূর্ণ (PBR+IBL, স্কাল্পটেড কোচওয়ার্ক, ইন্টেরিয়র-ম্যাপড শহর + ভেজা অ্যাসফল্ট, প্রতি-চাকার Pacejka ফিজিক্স, ২-বোন IK ক্যারেক্টার)। Final DoD **15/15** · ১৫ স্যুটে **৩৭৫ চেক** · ড্র-কল **mid ১৩৯ / low ৭১** · বিল্ড **৩,৩৮৩ kB / gzip ১,১৯৩ kB**। পরবর্তী: Act 4 — Android র‍্যাপার (Capacitor), APK, ব্যাক-বাটন, সেফ-এরিয়া
---

## ০. লুক-ডেভ (LOOK-DEV BRIEF v1.0 «REAL WORLD PASS») — STEP 1 সম্পূর্ণ

| বিষয় | মান |
| --- | --- |
| স্কোপ | §9 STEP 1 = Facade + Buildings (গেমপ্লে/ফিজিক্স/UI/সেভ **অস্পৃষ্ট**) |
| এন্ট্রি পয়েন্ট | `lookdev.html` (গেম `index.html` আলাদা, বান্ডলে lookdev কোড শূন্য) |
| গেট | **6/6 PASS** — glbReport · noBoxes · boxInDisguise · wallRuns · determinism · detailDensity |
| ধাপ | **STEP 1** (facade+buildings) ✅ · **STEP 2** (street+city) ✅ · **STEP 3** (car) ✅ · STEP 4/5 বাকি |
| ড্র-কল / ট্রায়াঙ্গল | **29–31** / **82,936** (বাজেট ≤220 / ≤900k) |
| টেক্সচার মেমরি · ম্যাটেরিয়াল | **20.8 MB** / **8** (ক্যাপ 220 MB / 16) |
| ব্লক | ৬০ m, দুই পাশে ৩টি করে বিল্ডিং, ডিটেইল এলিমেন্ট **1,768**, সর্বোচ্চ wall run **10.68 m** |
| স্ট্রিট | **85** প্রপ · **647** স্ট্রিট-ডিটেইল · ৯ পুডল (শুধু rain-এ রেন্ডার) · ক্যাটেনারি কেবল · ২০ সিটি-মাস |
| ক্লে রেন্ডার | `tools/_ld_clay.png` (§5.4) · হিরো `tools/_ld_hero.png` |
| রিপোর্ট | `docs/LOOKDEV_REPORT.md` (§13 ফরম্যাট) · গেট আউটপুট `docs/lookdev_gates_step1.txt` |
| ডেভিয়েশন | L3: GLB নেই → STEP 3-এ প্রোসিডিউরাল গাড়ি · §10: সব ম্যাপ প্রোসিডিউরাল, নামকৃত |
| গাড়ি | প্রোসিডিউরাল **4.300 × 1.423 × 1.774 m**, ৮ ম্যাটেরিয়াল, ৯,৩৬০ ট্রা · `tools/_ld_car_b.png` (শট B) · `_ld_car_clay.png` |
| পরবর্তী | STEP 4 — `src/render/Lighting.js` (HDRI env, tier-ভিত্তিক shadow map, hemisphere fill, horizon fog, GTAO, AgX) |

### কীভাবে দেখবেন
```bash
export LD_LIBRARY_PATH=/home/user/.deps/root/usr/lib/x86_64-linux-gnu
npm run dev     # http://localhost:5173/lookdev.html  → [C] ক্লে, [H] হিরো, [G] গেট
node tools/lookdev_gates.mjs
node tools/lookdev_shots.mjs
```

---

## ১. এক নজরে

| বিষয় | মান |
| --- | --- |
| স্ট্যাটাস | ✅ খেলার যোগ্য (single-file `dist/index.html`) |
| মোট ফাইল | ৫৯ (`src/`) · ~১১,৯০০ লাইন |
| বিল্ড সাইজ | ৩,৩৮৩ kB · gzip ১,১৯৩ kB (সব ইনলাইন, শূন্য নেটওয়ার্ক রিকোয়েস্ট) |
| বুট টাইম | ০.৭৩ সে (হেডলেস, cold — PMREM IBL বেক সহ) |
| অটোমেটেড চেক | **২১/২১ (v1) · ১৭/১৭ (Juice) · ১৯/১৯ (Act 1b)**, console error ০ |
| ড্র-কল | **low ৭১** · mid ১৩৯ (বাজেট ≤১৫০ / ≤৮৫) |
| ট্রায়াঙ্গল | ১.৬৮ লাখ (low tier, ৪০ ট্রাফিক গাড়ি সহ) |
| মিশন | ৭ (delivery, rescue, drone_delivery, escape, stunt, time_trial + no_damage ভ্যারিয়েন্ট) |
| চ্যারেক্টার | ৪ খেলোয়াড় + Boss Bulldozer Bapi |
| গাড়ি | ৫ খেলোয়াড়-যান + ৭ ট্রাফিক/পুলিশ def |
| EventBus ইভেন্ট | ৭২ |

---

## ২. খেলার নিয়ম (কীভাবে খেলবে)

**ডেস্কটপ:** `W A S D` / তীর — চালানো · `Shift` — নাইট্রো · `Space` — ড্রিফট · `E` — অ্যাকশন (গাড়িতে ওঠা/নামা, কথা বলা) · `R` — উল্টো গাড়ি ঠিক · `F` — যান বদল · `G` — গ্যারাজ · `M` — হেলিকপ্টার ম্যাগনেট · `Esc/P` — পজ

**মোবাইল (landscape):** বাঁ দিকে জয়স্টিক · ডানে NITRO · DRIFT · ↻ (আনস্টাক) · উপরে ডানে ❙❙ / গ / F

**শুরু:** মেনুতে **"শুরু করো ▸"** অথবা **"ক্যারেক্টার বাছো"** → চারজনের একজনকে বেছে নাও (তার গাড়ি নিয়েই শুরু)।

---

## ৩. DoD চেকলিস্ট (§4.7)

| # | শর্ত | অবস্থা | প্রমাণ |
| --- | --- | --- | --- |
| 1 | গেম একক `index.html` থেকে চলে, নেটওয়ার্ক ছাড়া | ✅ | `dist/index.html`, `requestfailed` ইভেন্ট ০ |
| 2 | কোনো placeholder / TODO / stub নেই | ✅ | `grep -rn "TODO\|FIXME\|placeholder" src/` → ০ |
| 3 | স্ট্যাক লক করা (Three.js + Rapier + Web Audio + Pointer + Vite singlefile) | ✅ | `package.json`, `vite.config.js` |
| 4 | ৬০ Hz fixed step + render interpolation | ✅ | `GameManager.FIXED_STEP`, `syncVisual(alpha)` |
| 5 | EventBus-only যোগাযোগ | ✅ | ৭২ ইভেন্ট, সাব-সিস্টেমে সরাসরি ক্রস-কল নেই |
| 6 | সব গেম-কনটেন্ট JSON-এ (গাড়ি/মিশন/চ্যারেক্টার/অডিও/আপগ্রেড) | ✅ | `src/data/*.json` |
| 7 | রানটাইমে mesh allocation নেই (পুলিং) | ✅ | Particle/Skid/Taka/Traffic/Pedestrian/Police/Hoop পুল |
| 8 | ৭ মিশন + স্টার persist (`desi_overdrive_v1_stars`) | ✅ | `stars persist to localStorage` ✅ |
| 9 | Wanted ০–৫ + পুলিশ ইন্টারসেপ্ট + হেলিকপ্টার | ✅ | প্রোব পাস |
| 10 | Boss ৬-স্টেট FSM | ✅ | `boss reached an aggressive state` ✅ |
| 11 | ৪ চ্যারেক্টার + সিলেক্ট UI + persist | ✅ | `debug_character.mjs` |
| 12 | HUD: landscape, safe-area, ≥৪৮ dp, জয়স্টিক/নাইট্রো/ড্রিফট/অ্যাকশন, মিনিম্যাপ, সাবটাইটেল | ✅ | `shot_mobile.png` (844×390 @2x) |
| 13 | বাংলা টেক্সট সব জায়গায় রেন্ডার হয় (টফু নেই) | ✅ | `fonts.css` base64 |
| 14 | পারফরম্যান্স বাজেট (mid ≤১৫০ ড্র-কল, টেক্সচার ≤১০২৪) | ✅ | ১২০ ড্র-কল |
| 15 | SQL/নেটওয়ার্ক/অ্যানালিটিক্স নির্ভরতা নেই | ✅ | শূন্য |
| 16 | ডকুমেন্টেশন: AUDIT / MASTERPLAN / CHANGELOG / STATUS | ✅ | এই ৪টি ফাইল |
| 17 | অটোমেটেড রিগ্রেশন স্যুট | ✅ | `tools/smoke_test.mjs` ২১ চেক |
| 18 | Snapdragon 680-এ ৬০ FPS | ⏳ | হেডলেস SwiftShader-এ মাপা অসম্ভব → P3 |

---

## ৪. পারফরম্যান্স মেট্রিক (হেডলেস, SwiftShader — ফোনের সংখ্যা নয়!)

| মেট্রিক | low | mid |
| --- | --- | --- |
| ড্র-কল | ৮০–৯৩ | ১২০ |
| ট্রায়াঙ্গল | ৫৭,১৩০ | ৬২,০১২ |
| ড্র-কল বাজেট | ১০০ ✅ | ১৫০ ✅ |
| avg frame | ১৫২.৬ ms (৬.৬ fps — সফটওয়্যার রাস্টারাইজার) | ~১৬৭ ms |
| p95 frame | ১৭৭ ms | ~১৯১ ms |
| সিম/ওয়াল-ক্লক অনুপাত | ০.৭৩ | ০.৭৩ |

> **সতর্কতা:** কন্টেইনারে GPU নেই; ফ্রেম ৬–১০ fps আসা স্বাভাবিক। তাই ফিজিক্স যাচাই করা হয়েছে **সিম-টাইম** (`frame/60`) দিয়ে, কখনো ওয়াল-ক্লক দিয়ে নয়। আসল FPS মাপার একমাত্র জায়গা Snapdragon 680 ডিভাইস (P3)।

---

## ৫. বাগ তালিকা

### ঠিক করা (এই সাইকেলে)
1. সাসপেনশন — ০ চাকা গ্রাউন্ডেড, গাড়ি লাফাচ্ছিল → এখন ৪/৪, `y` ০.৬৪–০.৬৫।
2. ত্বরণ ৪.৬৬ → **৮.৫৮ m/s²** (রোলিং রেজিস্ট্যান্স + `linearDamping` ঠিক)।
3. মেনু থেকে গেম শুরু হচ্ছিল না; `hide()` রিকার্শন।
4. `getHudState` ক্র্যাশ (stunt/escape মিশনে `destination` নেই)।
5. ট্রাফিক প্লেয়ারকে ভেদ করে যেত → নোজ-টু-নোজ স্টপ (min dist ৫.৪ m)।
6. ড্র-কল ৫০৯ → ১২০ (বিল্ডিং ডাবল-ড্র, ব্লক/কার্ব instancing, যান মার্জ)।
7. বাংলা ফন্ট ও ইমোজি গ্লিফ → টফু বক্স।
8. গাড়ির চাকা বডির ভেতরে লুকে যাওয়া।
9. `diag().drawCalls` → `undefined`।
10. স্টার persist-এ ২৫০ ms ডিবাউন্স রেস → স্টার এখন সাথে সাথে লেখা হয়।

### জানা সীমাবদ্ধতা (বাগ নয়, সচেতন সিদ্ধান্ত)
| # | বিষয় | কারণ / পরিকল্পনা |
| --- | --- | --- |
| L1 | পথচারী কাইনেমেটিক | পারফরম্যান্স; ধাক্কায় পথচারী "ভয় পেয়ে সরে যায়" রিঅ্যাকশন দিয়ে কভার |
| L2 | InstancedMesh-এ per-instance opacity নেই | দূরত্ব-ভিত্তিক draw distance দিয়ে ফেড |
| L3 | ট্রাফিক গাড়ির চাকা ঘোরে না (baked shell) | gameplay দূরত্বে অদৃশ্য; প্লেয়ার/পুলিশ/Boss-এ চাকা ঘোরে |
| L4 | বাংলা ভয়েস ব্রাউজার TTS-নির্ভর | না থাকলে formant `chatter()`; আসল ক্লিপ P3 |
| L5 | বিল্ডিংয়ে জানালা/ফ্যাসাদ টেক্সচার নেই | ফ্ল্যাট শেডিং (স্টাইল-গঠনমূলক); P3-এ ৫১২ অ্যাটলাস |
| L6 | iOS Safari-তে `speechSynthesis` gesture দরকার | "শুরু করো" ট্যাপেই আনলক হয় |

---

## ৬. টেস্ট রেসিপি (কপি-পেস্ট)

```bash
cd /home/user
npm install                                   # node_modules স্ন্যাপশটে থাকে না
export LD_LIBRARY_PATH=/home/user/.deps/root/usr/lib/x86_64-linux-gnu

node tools/smoke_test.mjs dist/index.html   # ২১টি অটোমেটেড চেক (v1)
node tools/smoke_juice.mjs                  # ১৭টি juice চেক (Act 1a)
node tools/smoke_act1b.mjs                  # ১৯টি a11y + metrics + পারফ চেক (Act 1b)
node tools/smoke_act2.mjs                   # ৩৮টি ক্যামেরা v2 + রিপ্লে + ডিরেক্টর চেক (Act 2)
node tools/smoke_act2b.mjs                  # ২৪টি PostFX + LUT + Director's Cut চেক (Act 2b)
node tools/shot_cinematic.mjs               # cinematic/ ফোল্ডারে ২টি প্রমাণ-স্ক্রিনশট
node tools/smoke_act3.mjs                   # ৩০টি Tension + Director + SetPiece + Chaos চেক (Act 3)
node tools/shot_grade.mjs                   # cinematic/grade_{day,night,overdrive}.png
node tools/smoke_act3b.mjs                  # ২১টি RubberBand + Ghost + Daily চেক (Act 3b)
node tools/smoke_act4.mjs                   # ২৪টি সংলাপ + গ্যাগ + এপিসোড + ব্রিফিং চেক (Act 4)
node tools/smoke_act4b.mjs                  # ৩৩টি প্লেথ্রু + ToneGuard + সিজন প্যানেল + মোবাইল লেআউট চেক
node tools/smoke_act5.mjs                   # ৩৩টি রিকশা টিপ-মডেল + স্লশ + Episode 2 চেক
node tools/smoke_act5b.mjs                  # ২৭টি বৌদি AI + শট-লিস্ট/কিউ + Adaptive Music চেক
node tools/smoke_act5c.mjs                  # ২৪টি Photo Mode + Share Card + Analytics চেক
node tools/tone_audit.mjs                   # ৫১ নিষিদ্ধ টোকেনের বিল্ড-টাইম টোন অডিট
node tools/balance_sweep.mjs                # ChaosSystem টিউনিং গ্রিড (রেপ্লিকা, মিলিসেকেন্ডে)
node tools/balance_model.mjs                # একই টিউনিং আসল ক্লাসে যাচাই (casual/average/expert)
node tools/shot_story.mjs                   # cinematic/story_briefing.png
node tools/shot_chaos.mjs                   # cinematic/hud_chaos_{desktop,mobile}.png
node tools/debug_accel.mjs                  # ত্বরণ / গ্রাউন্ডেড চাকা
node tools/shots.mjs                        # ৪টি স্ক্রিনশট + diag
node tools/debug_character.mjs              # ক্যারেক্টার সিলেক্ট ফ্লো
node tools/debug_mobile.mjs                 # 844×390 মোবাইল HUD
node tools/smoke_p4c.mjs                    # ১৯টি পাড়া/ফ্যাসাদ চেক
node tools/bench_facade.mjs 5               # ফ্যাসাদ A/B (avg/p50/p95)
node tools/final_dod.mjs                     # ১৫ সারির Final DoD (মাপা)
node tools/debug_traffic.mjs                # ট্রাফিক প্লেয়ার ভেদ করে কি না
npx vite build                              # single-file বিল্ড
```

সরাসরি ব্রাউজারে খেলতে: `dist/index.html` খোলো (ডাবল-ক্লিক)। ডেভ সার্ভার: `npx vite` → `http://localhost:5173`.

---

## ৭. পাঁচটি রিভিউ প্রশ্ন (উত্তর দিলে P3 শুরু হবে)

1. **গতির অনুভূতি (feel):** ০→১০০ km/h ≈ ৩.৩ সে, নাইট্রোতে FOV ৭৫° — এটা বেশি "arcade", না আরও বাস্তবসম্মত (ধীর, ভারী) চাও?
2. **আর্ট ডিরেকশন:** এখন ফ্ল্যাট-শেড লো-পলি বিল্ডিং। P3-এ (ক) জানালার টেক্সচার অ্যাটলাস, না (খ) টুন-শেডেড আউটলাইন + কমিক লুক — কোনটা?
3. **কনটেন্ট প্রায়োরিটি:** পরের ধাপে কোনটা আগে — (ক) Capacitor APK, (খ) বাংলা ভয়েস ক্লিপ, না (গ) ৩টি নতুন মিশন + নতুন এলাকা?
4. **পারফরম্যান্স টার্গেট:** টার্গেট ডিভাইস Snapdragon 680 @৬০ FPS-ই থাকবে, না ৭২০G/হায়ার-এন্ডে ৯০ FPS + বেশি ট্রাফিক (৬০)?
5. **টোন/ভাষা:** কমেডি লাইনগুলো (RJ, নাইট্রো নানি, ট্রাফিক মামা) ঠিক আছে, না কোনো লাইন আরও "পাড়া-মিষ্টি" বা আরও "স্ল্যাং" করতে হবে? — কোনো লাইন অস্বস্তিকর ঠেকলে বলো, বদলে দেব।

---

## ৮. Phase 3-এর জন্য প্রস্তাবিত প্রথম ৫টি কাজ
1. Snapdragon 680-এ প্রোফাইল → টিয়ার থ্রেশহোল্ড ও ট্রাফিক বাজেট ক্যালিব্রেট।
2. ফ্যাসাদ অ্যাটলাস (draw call না বাড়িয়ে)।
3. বাংলা ভয়েস ৩২ লাইনের অডিও বেক + `audio_cues.json` ম্যাপিং।
4. Capacitor `android/` + সাইন করা APK।
5. গেমপ্যাড সাপোর্ট + কিবোর্ড রিম্যাপ UI।
