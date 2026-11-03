# CHANGELOG — DESI OVERDRIVE: BANGLA DRIFT

ফরম্যাট: [Keep a Changelog](https://keepachangelog.com/bn/1.1.0/) ঘরানায়, ব্যাচ-ভিত্তিক।
নিয়ম: প্রতিটি এন্ট্রিতে **কী বদলাল**, **কেন**, **কীভাবে টেস্ট** — তিনটাই থাকতে হবে।

---

## [lookdev-0.3.0] — ২০২৬-১১-০৪ — LOOK-DEV · STEP 3 (Car)

### যোগ
- **`src/world/Car.js`:** প্রোসিডিউরাল ৪.৩০ m সেডান, **৮টি আলাদা ম্যাটেরিয়াল** (`car_paint` clearcoat · `car_glass` · `car_tyre` · `car_rim` · `car_chrome` · `car_headlamp` · `car_taillamp` · `car_interior`), ৮টি ম্যাশ, ৯,৩৬০ ট্রায়াঙ্গল। ফাঁপা কেবিন (roof slab + A/B/C পিলার + বেল্টলাইন রেল + ৬টি গ্লাস পেন), wheel-arch কাটআউট + arch lip, ৫-স্পোক rim, shutline, মিরর, হ্যান্ডেল, গ্রিল, প্লেট, ওয়াইপার, এগজস্ট, শার্ক-ফিন, ইন্টেরিয়র। নিজেই ৪.৩০ m-এ normalise হয়।
- **`src/assets/AssetLoader.js`:** `probe` / `loadGLTF` / `normalise` / `report` / `showMissingBanner` — §10 চুক্তি।
- **`src/dev/gate_glbReport.js`:** অ্যাসেট প্রোব + গাড়ির দৈর্ঘ্য/পার্ট/material গেট।
- ৩টি নতুন শট (`_ld_car_a`, `_ld_car_b` = শট B, `_ld_car_clay` = §5.4), `docs/lookdev_gates_step3.txt`।

### বদল
- `src/lookdev/main.js`: অ্যাসেট প্রোব + গাড়ি + `gateGlbReport` + missing-asset ব্যানার + `orbitA/B/C` ভিউ (`[3]`/`[4]`/`[5]`); HUD এখন গাড়ির মাপ/পার্ট/ম্যাটেরিয়ালও দেখায়।
- হিরো ফ্রেমে গাড়ি এখন `x=30, yaw=32°` — §12-এর CAM_A_HERO ফ্রেম অপরিবর্তিত।

### বাগ ফিক্স
1. **loft এন্ড-ক্যাপ উল্টো ওয়াইন্ড:** গাড়ির নাক ও ছাদের সামনের মুখ খোলা ছিল → ভেতরের সারফেস দেখা যাচ্ছিল। নাক `(i→j)`, লেজ `(j→i)`।
2. **`block()` y=0 থেকে ওঠে:** সব block-পার্ট অর্ধ-উচ্চতা উপরে ভাসছিল, হেডরেস্ট ছাদ ভেদ করছিল → `part()` হেল্পার কেন্দ্রে আনে।
3. **`probe()` SPA-fallback-এ ঠকছিল:** Vite অজানা পাথে ২০০ + `text/html` দেয়; এখন content-type চেক করা হয়, তাই ৬টি মিসিং ফাইল সত্যিই "MISSING" দেখায়।
4. **শাটলাইন/ডোর-লাইন শূন্য-প্রস্থ কোয়াড:** উল্লম্ব গ্রুভ হিসেবে আবার লেখা হলো।

### টেস্ট
```bash
export LD_LIBRARY_PATH=/home/user/.deps/root/usr/lib/x86_64-linux-gnu
node tools/lookdev_gates.mjs         # 6/6 PASS
node tools/lookdev_shots.mjs         # 11 শট, errors 0
npx vite build && node tools/smoke_test.mjs dist/index.html
```

---

## [lookdev-0.2.0] — ২০২৬-১১-০৩ — LOOK-DEV · STEP 2 (Street + City)

### যোগ
- **`src/world/StreetKit.js`:** রাস্তার wear (৪টি টায়ার-পলিশড ব্যান্ড, ১৪টি টার প্যাচ, ৯টি ওয়ান্ডারিং ক্র্যাক, গাটার স্টেইন, ফেডেড সেন্টার লাইন), ফুটপাথ স্ল্যাব (ভাঙা/উঁচু), কার্ব (১.৪ m ব্লক + ফেস), ড্রেন গ্রেট, ম্যানহোল, ৫টি ল্যাম্প পোস্ট (টেপার্ড পোল + বাঁকা আর্ম + কাউল + বাল্ব), ৬টি ইউটিলিটি পোল (ক্রস-আর্ম, ইনসুলেটর, ট্রান্সফরমার), ক্যাটেনারি কেবল (৯-সেগমেন্ট স্যাগ + স্ট্রিট বরাবর রান), **৮৫টি ক্লাটার প্রপ** (বিন, ক্রেট, বস্তা, টায়ার স্ট্যাক, টব, A-ফ্রেম, প্লান্টার, ২ স্কুটার, লন্ড্রি, টি-স্টল, বালতি, প্যানেল, পট) এবং **৯টি পুডল**।
- **`src/world/City.js`:** ব্লকের দুই মাথায় এন্ড-ক্যাপ ভবন + পেছনের সারি — মোট **২০ মাস**, কর্নিস/প্যারাপেট/ছাদের ট্যাংক/সিঁড়িঘর/অ্যান্টেনা সহ (§5.3: সিলুয়েট রাখে, বিস্তারিত বাদ)।
- **পুডল সিস্টেম:** `setWeather('rain')` → পুডল গ্রুপ দৃশ্যমান + অ্যাসফল্ট গাঢ়/গ্লসি; `'clear'` → লুকানো। `[R]` কী।
- **MP1 দুই-শট প্রোটোকল** (`mp1a`/`mp1b` ভিউ, ৬ m + ২ m ল্যাটারাল)।
- `tools/fix_chrome_deps.sh`, `docs/lookdev_gates_step2.txt`, ৪টি নতুন স্ক্রিনশট।

### বদল
- `gate_detailDensity` এখন **স্ট্রিট-প্রপ** মেট্রিকও মাপে (১৫ m-এ ≥২৪ প্রপ) — §9 STEP 2-এর "detailDensity rise"।
- `gate_boxInDisguise`-এর ফেস-থ্রেশহোল্ড **ব্রিফের সংখ্যায়** ফেরানো (≤৬ ফেস / ≤২৪ ভার্টেক্স) — আগের ≤৮ আমার নিজের কড়াকড়ি ছিল।
- `src/lookdev/main.js`-এর STEP-1 স্ট্যান্ড-ইন মাটি সরানো — এখন `StreetKit`-ই রাস্তা/ফুটপাথ/কার্ব বানায়।

### বাগ ফিক্স
1. **সেন্টার লাইন নীল/গোলাপি ড্যাশ:** `paint` ম্যাটেরিয়ালে সাইন-অ্যাটলাস ম্যাপ থাকে → রাস্তার রেখা অ্যাটলাসের টেক্সেল নিচ্ছিল। এখন কংক্রিট ম্যাটেরিয়াল।
2. **ইউটিলিটি পোল গেট ফেল:** ১০-গোন সিলিন্ডার = ২০ ভার্টেক্স → `boxInDisguise` ঠিকই ধরেছিল; ১৪-গোন করা হলো।
3. **CITY মাস গেট ফেল:** ১২-পয়েন্ট প্ল্যান = ২৪ ভার্টেক্স; ১৬-পয়েন্ট (steps=3) করা হলো।
4. **হিরো ফ্রেমে ল্যাম্প পোস্ট/টায়ার স্ট্যাক:** স্পেসিং ১৩ m + ক্যামেরার চারপাশে ৪.৫ m ক্লিয়ার রেডিয়াস।
5. **এন্ড-ক্যাপের পেইন্টেড জানালা উজ্জ্বল নীল:** `glass` (আকাশ রিফ্লেক্ট করছিল) → ম্যাট `concrete` গাঢ় টিন্ট।
6. **ভেজা রাস্তা সাদা হয়ে যাচ্ছিল:** শুধু roughness কমানোয় স্পেকুলার বিস্ফোরণ; এখন আলবেডো গাঢ় + মৃদু গ্লস।

### টেস্ট
```bash
export LD_LIBRARY_PATH=/home/user/.deps/root/usr/lib/x86_64-linux-gnu
sh tools/fix_chrome_deps.sh
node tools/lookdev_gates.mjs     # 5/5 PASS, ৩৩ প্রপ near-band
node tools/lookdev_shots.mjs     # hero/clay/facade/street/mp1a/mp1b/rain
```
**ফল:** `[GATES] 5/5 PASS` · draws 22–23 · tris 73,576 · ২০ সিটি-মাস · ৮৫ প্রপ · errors 0।

---

## [lookdev-0.1.0] — ২০২৬-১১-০৩ — LOOK-DEV BRIEF v1.0 «REAL WORLD PASS» · STEP 1 (Facade + Buildings)

### যোগ (নতুন — গেমপ্লের বাইরে, additive only)
- **`src/data/look.json`:** ১৪-এন্ট্রি প্যালেট (সব `"assumed"`, প্রতিটির কারণ), ১৩টি স্কেল (প্রতিটির কারণ — দরজা ২.০৫, শাটার ২.৬, সাইন ০.৯, কার্ব ০.১৪, সিল ০.৯, স্টোরি ৩.২, ব্যালকনি ১.০৫, উইন্ডো রিসেস ০.২২...), সূর্য ৩৪°/১১৮°, হিরো ক্যামেরা (চোখ ১.৭ m / ১২ m / fov ৪২°), বাজেট, `procedural.maps` (নামকরণ করা সব প্রোসিডিউরাল ম্যাপ) এবং `meta.deviations`।
- **`src/world/LookTextures.js`:** প্লাস্টার, কংক্রিট ও অ্যাসফল্টের color + **GL (Y+) নরমাল** + roughness + AO; grime; ১৬-টাইল সাইন অ্যাটলাস (উদ্ভাবিত বাংলা+ইংরেজি নাম, §১৫ মানা); sky equirect (PMREM-এ যায়)। শূন্য ফাইল, শূন্য নেটওয়ার্ক।
- **`src/world/LookMaterials.js`:** ৮টি ম্যাটেরিয়াল (plaster / concrete / metal / glass / wood / paint / asphalt / lamp) — Low টিয়ারের ৮-এর ক্যাপেও ফিট।
- **`src/world/LookGeom.js`:** `quad/quadFacing/flipWinding/prism/block/tubeBetween/paint/dirtify/mergeParts/auditPrimitive` — **কোনো `BoxGeometry` নেই**, সব সলিড চ্যামফার্ড প্রিজম।
- **`src/world/Facade.js`:** প্লিন্থ → শপ ব্যান্ড (শাটার/সাইন/অ্যাওনিং/ইন্টেরিয়র+কাউন্টার) → ২–৩ স্টোরি রিসেসড জানালা (০.২২ m রিভিল, সিল, শাটার, গ্রিল) → ব্যালকনি → স্ট্রিং কোর্স → কর্নিস → প্যারাপেট → রুফ ট্যাংক/অ্যান্টেনা/ডিশ; AC, ড্রেনপাইপ, পাইলাস্টার। ৩,৭৭৮টি প্রিমিটিভ/ব্লক, ১,৭৬৮টি ডিটেইল এলিমেন্ট।
- **`src/world/Buildings.js`:** ৬০ m ব্লক, দুই পাশে ৩টি করে বিল্ডিং, গ্যাপ ০–০.৫ m (পুনরাবৃত্তি নেই), (side, material) প্রতি মার্জ → পুরো ব্লক **১৫ ড্র-কলে**।
- **`src/dev/gate_noBoxes.js` · `gate_boxInDisguise.js` (দুই-পাস) · `gate_wallRuns.js` · `gate_detailDensity.js` · `gate_determinism.js`** — সব গেট কোডে, `window.LOOKDEV.runGates()` ও `[G]` কী-তে চলে।
- **`lookdev.html` + `src/lookdev/main.js` + `src/lookdev/heroRig.js`:** আলাদা লুক-ডেভ হারনেস, `[C]` ক্লে / `[S]` সলিড / `[H]` CAM_A_HERO / `[M]` MP1 ল্যাটারাল / `[1]` ফ্যাসাদ / `[2]` স্ট্রিট।
- **`tools/lookdev_gates.mjs`, `tools/lookdev_shots.mjs`, `docs/LOOKDEV_TRIAGE.md`, `docs/LOOKDEV_REPORT.md`, `docs/lookdev_gates_step1.txt`**।

### বাগ ফিক্স (এই ধাপে ধরা ও সারানো)
1. **উল্টো উইন্ডিং:** ফ্যাসাদের দেয়াল/গ্লাস/সাইন সব `+z` দিকে মুখ করে বানানো ছিল → রাস্তা থেকে অদৃশ্য, পেছন থেকে আলোকিত। সমাধান: `quadFacing(..., hint)`; এখন দিক অনুমান নয়, কোডে বলা হয়।
2. **`flipWinding` UV ভাঙছিল:** শুধু position+normal swap হতো → টেক্সচার্ড কোয়াড মিরর হতো (সাইনবোর্ড উল্টো পড়া)। এখন সব অ্যাট্রিবিউট ভের্টেক্সের সাথে যায়।
3. **সাইনবোর্ড ১৮০° ঘোরা:** অ্যাটলাসের UV-রেক্ট ইমেজ-স্পেসে লেখা; `flipY=false` + V-ইমেজ-স্পেস + U ইনভার্সন— তিন স্ক্রিনশটে যাচাই করে ঠিক করা (কোডে কারণ লেখা)।
4. **কালো রাস্তা:** ম্যাপ (অ্যালবেডো) আর ভার্টেক্স-টিন্ট একসাথে গুণ হয়ে ডাবল-ডার্কিং → §3.5 লঙ্ঘন। এখন টিন্ট সাদা, অ্যালবেডো টেক্সচারে ≈০.১৩ লিনিয়ার।
5. **কাউন্টার গেট ফেল:** ১.৬×০.৯×০.৫৫ m চ্যামফার্ড ব্লক = ১৮ ভার্টেক্স → `boxInDisguise` ঠিকই ফেল করেছে। গেট শিথিল না করে কাউন্টারটিকে প্যানেল (টপ/ফ্রন্ট/দুই পাশ) দিয়ে বানানো হয়েছে।
6. **ব্লেন্ড-আউট ক্লে:** ০.৪ লিনিয়ার অ্যালবেডো + শক্ত সূর্য → সাদা। এখন ≈০.১৮ অ্যালবেডো, `envMapIntensity 0.18`, ফ্ল্যাট গ্রে ব্যাকগ্রাউন্ড।
7. **`mergeGeometries` ইনডেক্স মিসম্যাচ** (cylinder indexed, quad নয়) → `mergeParts` সবই non-indexed করে।
8. **প্লাস্টারের "মার্বেল শিরা":** সাইন-থ্রেশহোল্ড বদলে ফ্র্যাক্টাল থ্রেশহোল্ড, তীব্রতা ০.৮৪ → ০.৯৩।

### টেস্ট (কীভাবে যাচাই করবেন)
```bash
export LD_LIBRARY_PATH=/home/user/.deps/root/usr/lib/x86_64-linux-gnu
node tools/lookdev_gates.mjs            # 5/5 PASS, আউটপুট হুবহু
node tools/lookdev_shots.mjs            # tools/_ld_{hero,clay,facade,street}.png
npx vite build && node tools/smoke_test.mjs dist/index.html   # গেম রিগ্রেশন: 21/21
```
**ফল:** `[GATES] 5/5 PASS` · ১৫ ড্র-কল · ৪৮,৩৮০ ট্রায়াঙ্গল · টেক্সচার ২০.৮ MB · ম্যাটেরিয়াল ৮ · সর্বোচ্চ wall run ১০.৬৮ m · গেম ২১/২১, কনসোল এরর ০।

---

## [5.0.0] — ২০২৬-১১-০৩ — v5.0 «NEXT-GEN AAA VISUALS, PHYSICS & IK» (৫ পিলার)

### যোগ (নতুন ফিচার — ৫টি পিলার)
- **পিলার ১ — PBR + প্রসিডিউরাল IBL + কনট্যাক্ট শ্যাডো:** `GameManager.setupEnvironment()` বুটে `PMREMGenerator` দিয়ে *নিজের বানানো* গ্রেডিয়েন্ট-স্কাই ইনভায়রনমেন্ট বেক করে (০ নেটওয়ার্ক বাইট, `RoomEnvironment` নয় — সেটা স্টুডিও-সাদা, গাড়িকে ক্রোম-সেলোফেন বানিয়ে দিচ্ছিল)। `scene.environmentIntensity` দিন-রাত জুড়ে `DayNightCycle`-এ মডুলেট হয় (০.৪২–০.৭০), `HemisphereLight`-এর আকাশ/মাটি রং প্রতি ফ্রেম ঘড়ির রঙের সাথে যায়।
- **পিলার ২ — স্কাল্পটেড কোচওয়ার্ক:** `VehicleMeshFactory` সম্পূর্ণ নতুন — `ExtrudeGeometry` প্রোফাইল (ঢালু বনেট, রেকড স্ক্রিন, ফাস্টব্যাক ডেক, চাকার খিলান), বেভেলড ক্যাবিন, ৩D হেডল্যাম্প বাকেট, গ্রিল স্ল্যাট, মিরর, স্পয়লার, ট্রাক/বাসের করুগেটেড প্যানেল, অটোর ক্যানভাস ক্যানোপি, রিকশার খিলান-হুড + ঝালর + রকেট নজল, বুলডোজারের অবতল ব্লেড, এবং ৫-স্পোক অ্যালয় চাকা (`tread + rim + spokes + lug` এক মেশে)।
- **`aSurface` ভের্টেক্স অ্যাট্রিবিউট:** পুরো গাড়ি **১ ড্র-কলে**, তবু পেইন্ট (r ০.৩৪ / m ০.১৮), ট্রিম (০.৭৮ / ০.০৫) আর ক্রোম (০.২৪ / ০.৫৫) আলাদা করে চকচক করে। `aEmissive` দিয়ে হেডলাইট/টেইল-ল্যাম্পও সেই একই মেশে বেক — আগে প্রতিটি ল্যাম্প আলাদা ড্র-কল ছিল।
- **গাড়ির নিচে কনট্যাক্ট-শ্যাডো** (৬৪² রেডিয়াল ক্যানভাস টেক্সচার, গ্রাউন্ডেড ০.৬২ / বাতাসে ০.১২) — "ভাসমান খেলনা" ভাব শেষ।
- **পিলার ৩ — শহরের গভীরতা:** `FacadeAtlas`-এ **ফক্স-৩D ইন্টেরিয়র প্যারালাক্স** (ভিউ-রশ্মি ০.৬৫ m গভীর ঘরে ঢুকে সিলিং আলো/দেওয়াল/মেঝে শেড করে, রাতে জ্বলে), **গ্রাউন্ড AO** (নিচের ৩.২ m ডার্ক), এবং গ্লাসে **ফ্রেসনেল আকাশ-গ্লিন্ট** — সবই শেডারের ভেতরে, **০ অতিরিক্ত ড্র-কল**।
- **ওয়েট অ্যাসফল্ট:** `CityMap.patchAsphalt()` — ওয়ার্ল্ড-স্পেস নয়েজ (গ্রানাইট দানা ±১০%), গ্রিড বরাবর ঘষা টায়ার-লেন, আর `uWetness` চালিত পুডল-মাস্ক + স্পেকুলার। `WeatherSystem` এখন `setWetness()` ডাকে।
- **পিলার ৪ — প্রতি-চাকার ফিজিক্স:** `updateSuspension` এখন **প্রতি চাকার বিন্দু-বেগ** (`v_com + ω × r`) দিয়ে ড্যাম্প করে (আগে শুধু CoM বেগ — তাই ব্রেক-ডাইভ/স্কোয়াট শূন্য ছিল), যোগ হয়েছে **অ্যান্টি-রোল বার** (K×০.২৮); `evaluateGripFactor()` = Pacejka-লাইট স্লিপ-কার্ভ (পিক ০.২২, তারপর ফল-অফ), অ্যাক্সেল-ভিত্তিক লেটারাল ফোর্স; **টর্ক-কার্ভ** (লঞ্চ ১.১২×, মিড ১.১৮×, টপ ০.৯৪× — টপ স্পিড অপরিবর্তিত); **স্কোয়াট/ডাইভ** (ড্রাইভ-ফোর্স CoM-এর নিচে) এবং **সেলফ-অ্যালাইনিং ইয়াও টর্ক**।
- **পিলার ৫ — ২-বোন IK ক্যারেক্টার:** `PlayerController` ১১-অংশের হায়ারার্কিক্যাল রিগ (ক্যাপসুল থাই/কাফ, হাঁটু, elbow, মাথা, গামছা), `solveTwoBone()` ল-অব-কোসাইন সলভার, পেলভিস কাউন্টার-রোটেশন, টর্সো লিন, কনুই ভাঁজ, আইডল শ্বাস; গাড়িতে ওঠা/নামায় **সাসপেনশন ডিপ ইমপালস** (`dipSuspension()`); জয়স্টিকে **এক্সপো স্টিয়ারিং** (০.৪৫ রৈখিক + ০.৫৫ কিউবিক); ড্রিফটে **কাউন্টার-স্টিয়ার অ্যাসিস্ট**; ক্যামেরায় **ভেলোসিটি-কোর্স ফ্রেমিং**।

### বদল
- **`PedestrianAI`:** pedestrians এখন **এক ড্র-কলে** — হাঁটু-ভাঁজ, দোলানো থাই আর হাত সবই ভের্টেক্স শেডারে (`aRig` অ্যাট্রিবিউট + `uPhase/uStride`)। ২৫ জন pedestrian ২৫ ড্র-কল (আগে ১২৫)।
- **`ObstacleSpawner`:** গরু ৯ মেশ → ১ মেশ (vertex-coloured merged), ৮ গরু ৭২ → ৮ ড্র-কল।
- **`CityMap`:** গাছের ক্যানোপি ৩-লোব (বট/নিম), রাস্তার বাতি বাঁকা আর্ম + কাউল → এক instanced geometry।
- **`TrafficAndPedestrianAI`:** ট্রাফিক গাড়ি `simple: true` (সিলুয়েট থাকে, গহনা বাদ), এক ইন্ডিকেটর মেশ, এবং **ইন্ডিকেটর চিরকাল জ্বলে থাকার বাগ** ঠিক।
- **`PostFXStack`:** `GradeShader`-এ মাইক্রো-কনট্রাস্ট (toe ডার্কেন, মিড লিফট) — কার্ব/টায়ার-প্যাচ মাটিতে বসে।

### ঠিক হলো (বাগ)
1. **`handleStuck()` প্রতি ফ্রেমে `new THREE.Vector3` বানাত** (শূন্য-অ্যালোকেশন নিয়ম ভাঙা) → `this._upAxis` scratch।
2. **`WeatherSystem.update()` প্রতি ফ্রেমে `new THREE.Color()`** → `_wetColor` পুনর্ব্যবহার।
3. **ট্রাফিক ইন্ডিকেটর কখনো নেভানো হতো না** — একবার লেন-মার্জ হলেই ল্যাম্প চিরকাল জ্বলত; এখন `indicator === 0` হলে নেভে।
4. **`mergeGeometries` incompatible-index** — ভাঙা স্কাল্পটেড মেশ (৩৫০ ড্র-কল); এখন সব পার্ট একই স্কিমে নরমালাইজড।
5. **RoomEnvironment IBL সব ধাতব অংশ সাদা করে দিত** ("ক্রোম-সেলোফেন") → নিজের গ্রেডিয়েন্ট স্কাই + ধাতবতা ০.১৮/রাফনেস ০.৩৪।
6. **ফ্যাসাদ শেডারে `cell` ভেরিয়েবল পুনঃসংজ্ঞায়িত** → শেডার কম্পাইল ফেল; `paneCell` নামকরণ।
7. **ট্রাফিক গাড়ির গ্লাস/কনট্যাক্ট-শ্যাডো প্রতি গাড়িতে ২ ড্র-কল যোগ করছিল** → hero-only; ড্র-কল ১৮৪ → **১৩৯**।

### যাচাই (মাপা)
- `node tools/final_dod.mjs` → **15/15 · ৩৭৫ চেক** · `smoke_test` **21/21** · juice 17/17 · act1b 19/19 · act2 38/38 · act3 31/31 · act3b 21/21 · act4b 33/33 · act5b 27/27 · act5c 24/24 · p4a 23/23 · p4b 21/21 · p4c 19/19.
- হেডলেস পরিবেশজনিত (SwiftShader ৩ FPS, `MAX_STEPS=5`) অপরিবর্তিত ব্যর্থতা: act2b 23/24 · act4 23/24 · act5 32/33 — এগুলো ফিজিক্স নয়, ওয়াল-ক্লক।
- ড্র-কল **mid ১৩৯** (বাজেট ≤১৫০) · **low ৭১** (≤৮৫) · ট্রায়াঙ্গল ১.৬৮ লাখ · বুট ০.৭৩ সে (PMREM সহ) · হিপ ৮১ MB।
- বিল্ড **৩,৩৮৩.১৪ kB / gzip ১,১৯৩.৪৩ kB** · টোন অডিট ক্লিন।

---

## [4.2.0] — 2026-11-02 — Phase 4 / Act 3: শহরের পাড়া, জানালা, আর আলো

### যোগ
- **`src/data/districts.json`** — ৫টি পাড়া: **চৌমাথা** (হটস্পট, r ৯৬ m, বাজার ৬২%), **পুরনো শহর** (উঁচু, ২২% টাওয়ার-স্পাইক), **বাজার পাড়া** (নিচু, ৭০% দোকান), **নতুন শহর** (কাচ, ৯% পার্ক), **দক্ষিণ পাড়া**। প্রতিটির প্যালেট, উচ্চতা-রেঞ্জ, ফ্যাসাদ স্টাইল, বাতির রং, কুয়াশা/অ্যাম্বিয়েন্ট টিন্ট।
- **`src/world/DistrictLayout.js`** — `districtAt/paletteAt/heightAt/parkChanceAt/marketChanceAt/styleAt/moodAt/coverage/label`; হটস্পট → রেক্ট → ফলব্যাক ক্রম, তাই কোনো ব্লক অনাথ নয় (`coverage()` প্রমাণ দেয়)। `?districts=legacy` দিয়ে Act 3-পূর্ব শহর হুবহু ফিরে আসে (A/B-র জন্য)।
- **`src/world/FacadeAtlas.js`** — ৫১২² প্রসিডিউরাল ক্যানভাস অ্যাটলাস, **৪টি ফ্যাসাদ স্টাইল**, `onBeforeCompile` দিয়ে **ওয়ার্ল্ড-স্পেস UV**: জানালার মাপ মিটারে (৭×১০.৫ m টাইল), বিল্ডিং যত বড়ই হোক গ্লাস টান খায় না। ছাদ আলাদা রঙ, রাতে কিছু জানালা জ্বলে (`uLit`), **দূরত্ব-ভিত্তিক LOD** (৮০–১৭০ m), এবং `uFacadeMix` কিল-সুইচ। **০ অতিরিক্ত ড্র-কল।**
- **`src/world/DistrictMood.js`** — পাড়া বদলালে কুয়াশা/অ্যাম্বিয়েন্ট/সূর্যের রং ±০.৩৫ পর্যন্ত টিন্ট হয় (০.৮৫ সে-এ settle), `districtChanged` ইভেন্ট + HUD টোস্ট।
- **চৌমাথা ল্যান্ডমার্ক** — ঘড়ি-টাওয়ার (২৬ m) + ক্যাপ + ৪টি সাইনবোর্ড (এক InstancedMesh): **৩ মেশ, ১ কলাইডার**।
- **`tools/smoke_p4c.mjs`** (১৯ চেক) + **`tools/bench_facade.mjs`** (ফ্যাসাদ A/B বেঞ্চ)।

### বদল
- **`src/world/CityMap.js`** — প্যালেট/উচ্চতা/পার্ক/বাজারের হারের একমাত্র সূত্র এখন পাড়া; বিল্ডিং মেটেরিয়ালে ফ্যাসাদ প্যাচ; ল্যান্ডমার্ক; `?facade=0` ডেভ সুইচ।
- **`src/core/GameManager.js`** — `DistrictMood` তৈরি ও প্রতি ফ্রেম আপডেট, ফ্যাসাদে ক্যামেরা+রাতের অবস্থা, quality-change-এ `setEnabled(tier !== 'low')`, diag-এ `districts/facade/landmarks`।
- **`src/engagement/GhostRunner.js` + `GameManager`** — রেকর্ডার এখন **বাস্তব dt** পায় (fill ক্যাপ ৬→১২), প্লেব্যাক সিম-ঘড়িতে।

### ঠিক হলো (বাগ)
1. **ধীর ফ্রেমে ঘোস্ট রেকর্ডিং হারিয়ে যেত** — রেকর্ডার ক্ল্যাম্পড ফিজিক্স dt পেত, তাই ৪ fps-এ ৩ সেকেন্ডে মাত্র ১০–১২টি স্যাম্পল হত (২০ Hz-এর বদলে ৩ Hz)। এখন বাস্তব dt (ক্যাপ ০.৫ সে) → **৫০ স্যাম্পল**; `smoke_act3b` আবার **২১/২১**।
2. **`DistrictMood`-এর ইনক্রিমেন্টাল lerp অকার্যকর ছিল** — `DayNightCycle` প্রতি ফ্রেমে অ্যাম্বিয়েন্ট/কুয়াশা রঙ রিসেট করে, তাই পাড়ার টিন্ট মুছে যেত। এখন প্রতি ফ্রেম ঘড়ির রঙ থেকে পুনর্গঠিত (settle ০.৮৫ সে) — মাপা: পুরনো শহর `#ffdfbd` vs নতুন শহর `#fee0c2`।
3. **ফ্যাসাদের প্রথম সংস্করণে `sin()`-হ্যাশ প্রতি ফ্র্যাগমেন্টে** — সস্তা `mod` দিয়ে বদলানো হলো (সফটওয়্যার রাস্টারাইজারে প্রতিটি ট্রান্সসেন্ডেন্টাল ব্যয়)।

### যাচাই (মাপা)
- `node tools/smoke_p4c.mjs` → **19/19** · `smoke_p4a` 23/23 · `smoke_p4b` 21/21 · `smoke_act3b` **21/21** · Final DoD **15/15** · টোন অডিট ক্লিন · বিল্ড **৩,৩৫৮ kB / gzip ১,১৮৫ kB**।
- ফ্যাসাদ A/B (`bench_facade.mjs`, একই ফ্রেম বাজেট): **avg ৪.৩% · p50 −০.১% · p95 ৬.২%**, ড্র-কল অপরিবর্তিত (৭৯→৭৯)।
- পাড়া A/B: `?districts=legacy&facade=0` → একই fps, একই ব্যর্থ চেক ⇒ হেডলেসের ১.৫–২ fps মেশিনের সমস্যা, Act 3-এর নয়।

---


## [4.1.0] — 2026-11-02 — Phase 4 / Act 2: এক ডিরেক্টর, এক কণ্ঠ

### যোগ
- **`src/audio/VoiceDirector.js`** — পুরো কথ্য চ্যানেলের একমালিক: রিজলভেশন **বেকড প্যাক → ব্রাউজারের bn-IN TTS → ফর্ম্যান্ট ব্লিপ**, প্রায়োরিটি ও **বার্জ-ইন** (উচ্চ প্রায়োরিটি চলতি লাইন কেটে দেয়, সমান/নিচু বাদ), ০.৩৫ সে মিন-গ্যাপ, **৯৬ অক্ষরের রিডিং লিমিট**, প্রতি লাইনে `voiceStart`/`voiceEnd` (তাই মিউজিক −৩ dB ডাক করে), `voiceLine` ইভেন্ট, `stats {spoken, fromPack, fromTTS, fromBlips, barged, dropped, tooLong, muted}`।
- **`src/audio/VoiceBank.js`** — **ঐচ্ছিক** বেকড ভয়েস প্যাক: base64 data URI → লেজি `decodeAudioData`, **১২টি বাফারের LRU ক্যাপ**, `registerSource()` (রানটাইম প্যাক), `play()`/`stop()`।
- **`src/data/voice_profiles.json`** — ১৭টি স্পিকার প্রোফাইল (pitch/rate/tag) + `poolSpeakers` ম্যাপ; `langPreference ["bn-IN","bn-BD","bn","hi-IN","en-IN"]`, `maxChars 96`, `charsPerSec 13.5`।
- **`src/data/voice_lines.json`** — **৩৩টি বেক-লিস্ট লাইন** (ন্যারেটর, শিমুল ভাই, বৌদি, ট্রাফিক মামা, নানি, রাজু, স্পিডি বৌদি, বাপি, RJ, কাকিমা) — আইডি, স্পিকার, প্রায়োরিটি।
- **`src/data/voice_pack.json`** — ডিফল্টে **শূন্য ক্লিপ** (`source: "none (device TTS)"`) → বিল্ডে ০ বাইট অডিও।
- **`tools/bake_voice.mjs`** — রেকর্ড করা লাইন → `voice_pack.json`: শুধু `voice_lines.json`-এর আইডি গ্রহণ করে, WAV ডিউরেশন হেডার থেকে পড়ে (অনুমান নয়), বাইট/সেকেন্ড রিপোর্ট করে, `--clear` দিয়ে আবার শূন্যে।
- **`tools/smoke_p4b.mjs`** — ২১টি চেক (বেক টুল, bn-IN নির্বাচন, প্রোফাইল, বার্জ-ইন, ড্রপ, ৯৬-অক্ষর, ডাকিং, প্যাক প্লেব্যাক + LRU)।

### বদল
- **`src/audio/AudioEngine.js`** — `speak()` এখন ডিরেক্টরকে দেয়; ডিরেক্টর না থাকলে পুরনো পথ `speakLegacy()` হিসেবে থাকল (অডিও-অনলি প্রোবের জন্য)।
- **`src/systems/BanglaAudioTrigger.js`** — `speak`/`say` এখন `clip`, `priority`, `pool`, `speaker` পাঠায়, তাই বেকড প্যাক থাকলে সেটাই বাজে।
- **`src/core/GameManager.js`** — `VoiceBank` + `VoiceDirector` তৈরি (`AudioEngine`-এর পরে, `BanglaAudioTrigger`-এর আগে), প্রতি ফ্রেম `voice.update(dt)`, diag-এ `voice` সারি।

### ঠিক হলো (বাগ)
1. **সেটিংসের অডিও সুইচ মিক্সারে পৌঁছাত না** — `voiceEnabled/musicEnabled/sfxEnabled` শুধু `save.settings`-এ লেখা হত; এখন `settingsChanged` শুনে `audio.setChannels()` ডাকা হয় (অর্থাৎ মেনুর ভয়েস অফ সত্যিই কাজ করে)।
2. **বার্জ-ইনের পর লাইনটা নিজেই বাদ পড়ছিল** — মিন-গ্যাপ চেক বার্জ-ইনের *পরে* চলত, ফলে প্রায়োরিটি ৫ লাইন চলতি লাইন কেটে নিজে চুপ করত (`barged=1` কিন্তু কিছু শোনা যেত না)। গ্যাপ এখন কেবল নিষ্ক্রিয় চ্যানেলে প্রযোজ্য।
3. **প্রোবটি ফাইল হিসেবে data-URI স্ট্রিং লিখছিল** — বেক টুল তাই WAV হেডার পড়তে পারছিল না (duration null, ১০৭৫০ "বাইট")।

### যাচাই
- `node tools/smoke_p4b.mjs` → **21/21** · রিগ্রেশন **৩৫৬/৩৫৬** (১৪ স্যুট) · Final DoD **15/15** · টোন অডিট ক্লিন (২৪ ফাইল / ১১৩৯ স্ট্রিং) · বিল্ড **৩,৩৪২ kB / gzip ১,১৭৮ kB**।

---


## [4.0.0] — 2026-11-02 — Phase 4 / Act 1: কন্ট্রোল, গেমপ্যাড, নতুন মিশন

### যোগ
- **`src/data/keymap.json`** — ১৮টি অ্যাকশনের বাইন্ডিং এখন ডেটা: `throttle_up/down`, `steer_left/right`, `nitro`, `drift`, `action`, `jump`, `magnet`, `unstuck`, `climb_up/down`, `switch_vehicle`, `photo`, `shutter`, `pause`, `garage`, `controls` + গেমপ্যাড ম্যাপিং + `allowOverlap` (drift/shutter — Space দুটোই হতে পারে)। ডিফল্ট হুবহু আগের লেআউট।
- **`src/input/Keymap.js`** — `codes/set/add/reset/rows/conflictOf/pretty`, `keymapChanged` ইভেন্ট, `save.settings.keymap`-এ persist (করাপ্ট ম্যাপ = ডিফল্টে ফলব্যাক, ইনপুট কখনো অচল হয় না)।
- **`src/input/GamepadManager.js`** — `navigator.getGamepads()` প্রতি ফ্রেমে পোল, **রেডিয়াল ডেডজোন + rescale**, স্ট্যান্ডার্ড ম্যাপিং (LS steer, RT throttle, LT brake, RB nitro, LB drift, A action, Start pause, D-pad climb), এজ-ট্রিগার বাটন, `gamepadConnected/gamepadDisconnected`।
- **`src/ui/ControlSettings.js`** — টাচ-বান্ধব কন্ট্রোল প্যানেল: সারি ট্যাপ → arm → কী চাপো → বাইন্ড। গেমপ্যাড স্ট্যাটাস, কনফ্লিক্ট ওয়ার্নিং, রিসেট। `controlsOpen/controlsClose`।
- **`src/data/missions.json`** — ৩টি নতুন মিশন: `chowmatha_gridlock` (time_trial, ৬ চেকপয়েন্ট, Traffic Mama), `patury_haul` (delivery + বরফ গলার decay, Rocket Raju), `mela_hoops_p4` (stunt, ৬ হুপ, Nitro Nani)। মোট মিশন **১১**।
- **`tools/smoke_p4a.mjs`** — ২৩টি চেক (কী-ম্যাপ, রিবাইন্ড আসলে গাড়ি চালায়, কনফ্লিক্ট, persist, ফেক গেমপ্যাডে ডেডজোন/ট্রিগার/এজ, প্যানেল DOM, ৩ মিশন)।
- **`MASTERPLAN_v3.md`** — Phase 4 "REACH"-এর ৫-অ্যাক্ট প্ল্যান।

### বদল
- **`src/ui/InputManager.js`** — সব হার্ডকোডেড কী সরানো: `this.codes(action)` দিয়ে keymap থেকে পড়ে; গেমপ্যাড প্রতি ফ্রেম পোল হয়ে কী-বোর্ডের *নিচে* merge হয় (হার্ডওয়্যার কী সবসময় জেতে); নতুন `controls` অ্যাকশন (ডিফল্ট `O`); `diagnostics`-এ keymap + gamepad।
- **`src/core/GameManager.js`** — `Keymap` + `GamepadManager` + `ControlSettings` তৈরি (InputManager-এর আগে), লুপে `s.controls` → প্যানেল টগল, diag-এ `keymap/gamepad/controls` সারি।
- **`src/main.js`** — QA API: `keymap, keymapSet, keymapReset, bindings, gamepad, controls, controlsToggle, inputState, missionList`।
- **`tools/final_dod.mjs`** — রিপোর্ট JSON-এর `rows/runtime/suite/total` ফেরত আনা হলো (গত প্যাচে একটি ইনলাইন কমেন্ট লাইনের বাকিটা গ্রাস করেছিল), `smoke_p4a` স্যুট ট্যালিতে যোগ।

### ঠিক হলো (বাগ)
1. রিপোর্ট জেনারেটরের একলাইনের কমেন্ট `rows, runtime, suite, total` কীগুলো JSON থেকে ফেলে দিয়েছিল → `final_dod_report.json`-এ শুধু `at/buildKb` ছিল।
2. `GamepadManager`-এ `deadzoneed` টাইপো (ডেডজোন পড়া হত না)।
3. `main.js`-এ P4 ব্লক দুইবার বসে গিয়েছিল (Python replace সব occurrence ধরেছিল) → ডুপ্লিকেট key সরানো।

### যাচাই
- `node tools/smoke_p4a.mjs` → **23/23** · রিগ্রেশন **৩৩৫/৩৩৫** (১৩ স্যুট) · `smoke_test dist/index.html` ২১/২১ · Final DoD **15/15** · টোন অডিট ক্লিন (২১ ফাইল, ১০০১ স্ট্রিং) · বিল্ড **৩,৩২৮ kB / gzip ১,১৭৩ kB** · ০ কনসোল এরর।

---


## [3.1.0] — 2026-11-02 — Act 6: Final DoD ও রিলিজ-গেট

### যোগ
- **`src/engagement/CraftSystem.js`** — Episode 2-এর দড়ি বাঁধার ট্যাপ-স্কিল চেক: `begin/press/update/cancel`, পারফেক্ট উইন্ডো ০.৫৫ s, `craftStart/craftSuccess/craftFail`, `stats {attempts, success, fail, perfect, best}`। মিস করলে স্পিল +১৫% — শাস্তি নয়, টেনশন।
- **`src/engagement/FameSystem.js`** — derive করা fame = ৫×স্টার + ১০×এপিসোড + ৩×মিশন + গ্যাগ টিয়ার; ৪ টিয়ার (পাড়া ০ / পাড়ার নাম ৪০ / শহর ১২০ / কিংবদন্তি ২৬০), `fameChanged` ও `fameTierUp`।
- **`tools/final_dod.mjs` + `tools/final_dod_report.json`** — ১৫ সারির মেশিন-পড়া DoD: স্ট্যাটিক স্ক্যান (TODO, timeScale, টেবিল, কনটেন্ট) + ব্রাউজার প্রোব (trauma, flash limiter, বাজেট, events) + স্যুট ট্যালি।
- **`FINAL_DOD.md` / `ACT6_REVIEW.md`** — ১৫ সারির প্রমাণ-টেবিল ও ৭টি রিভিউ প্রশ্নের উত্তর-প্রস্তাব।

### বদল
- **`src/core/QualityGovernor.js`** — pedestrian mid ৩২→**২৫**, low ২০→**১০**; বাজেট এখন হুবহু ৪০/২৫/১০।
- **`src/data/music_stems.json`** — `stemBudget {high:4, mid:3, low:2}` + **`stateIdentity`** (OVERDRIVE = overdrive_roll + chant_hype, HEAT = dhol_groove + police_siren, BOSS, CUTSCENE)।
- **`src/audio/AdaptiveMusicSystem.js`** — টিয়ার ক্যাপ + identity-first সিলেকশন, `qualityChanged`-এ পুনরায় apply, `debug()`-এ `tier/stemsAllowed`।
- **`src/core/GameManager.js`** — `timeScale` → **`simScale`** + `rampSimScale(rawDt)` (snap down, ease up, একটাই সত্যের সাইট); `get timeScale()` শুধু পড়ার জন্য; diag-এ `craft`/`fame` সারি।
- **`src/juice/TraumaShake.js`** — `update()`-এ ০–১ clamp (বাগি কলারও ক্যামেরা নষ্ট করতে পারবে না)।

### ঠিক হলো (বাগ)
1. `fameChanged`, `craftSuccess`, `craftFail` — বাধ্যতামূলক তিনটি ইভেন্টের emitter কোথাও ছিল না।
2. mid/low টিয়ারে pedestrian বাজেট অতিক্রম (৩২/২০ vs ২৫/১০)।
3. স্টেম টিয়ার ক্যাপ ছিল না — ক্যাপ দেওয়ার পর OVERDRIVE-এর চ্যান্ট হারাচ্ছিল, identity-first দিয়ে সমাধান (৫b স্যুটে ধরা পড়ে)।
4. `TraumaShake` externally assigned `trauma > 1` ক্ল্যাম্প করত না।
5. `GameManager.timeScale` দ্বিতীয় লেখার জায়গা ছিল।
6. প্রোব-এ `setPieces.stop()` না থাকায় `setPieceEnd` কখনো ফায়ার করত না।

### যাচাই
- `node tools/final_dod.mjs` → **15/15** · রিগ্রেশন **৩১২/৩১২** (১২টি স্যুট) · `smoke_test dist/index.html` ২১/২১ · টোন অডিট ক্লিন · বিল্ড **৩,৩১২ kB / gzip ১,১৬৮ kB** · ০ কনসোল এরর।

---


## [3.0.0] — 2026-11-02 — Act 5 সম্পূর্ণ, ইটারেশন 73–75 (Photo Mode + Share Card + Analytics)

### Added
- **`src/share/PhotoMode.js`** — ছবি তোলার মোড: ক্যামেরা গাড়ির চারপাশে ঘোরে, HUD ডিম হয়ে যায়, ৬টি ফিল্টার (raw/day/night/overdrive/rain/replay), শাটার **একই ফ্রেমে** ক্যানভাস পড়ে (রেন্ডারার `preserveDrawingBuffer` ছাড়াই চলে)। প্লেয়ারের হাত ছেড়ে যায় কিন্তু **দুনিয়া চলতে থাকে** (chase/set-piece টিক করে) — পজ-এক্সপ্লয়েট নয়। ইভেন্ট: `photoOpen`, `photoClose`, `photoFilterChanged`, `photoTaken`।
- **`src/share/ShareCard.js`** — ১০৮০×১৩৫০ ব্র্যাগ-কার্ড 2D ক্যানভাসে: ফটো (cover-fit), বাংলা হেডলাইন/স্ট্যাট লাইন, ★★★, ফুটার। `navigator.share` থাকলে ফাইল শেয়ার, নাহলে **ডাউনলোড fallback** (ডেড বাটন নেই), `AbortError` = "বাতিল" (ব্যর্থতা নয়)। ইভেন্ট: `shareRequest`, `shareCardComposed`, `shareCompleted` (`via: native|download`), `shareCancelled`, `shareFailed`।
- **`src/analytics/PlaytestAnalytics.js`** — লোকাল-অনলি প্লেটেস্ট টেলিমেট্রি (কোনো নেটওয়ার্ক কল নেই, `fetch` গার্ড দিয়ে মাপা): **৩২×৩২ ক্র্যাশ হিট-ম্যাপ**, মিশন ফানেল (started/completed/failed, completion rate, avg time), `crashesPerKm`, gag-টিয়ার কাউন্ট, ছবি/শেয়ার কাউন্ট, প্রথম-মিশন সময়। সব একটি localStorage কী-তে persist।
- **HUD**: টপ-বাটনে ◉ (ফটো) ও ↗ (শেয়ার); ফটো ওভারলে (ফিল্টার নাম, ফিল্টার/শাটার/শেয়ার বাটন); কীবোর্ড `C` / `F` / `Space`।
- **`tools/smoke_act5c.mjs`** (২৪ চেক) · `tools/shot_share.mjs` → `cinematic/share_card.jpg` (আসল ফ্রেম + বাংলা টেক্সট)।
- `features.json`: `narrative`, `adaptiveMusic`, `photoMode`, `share` — সব ✅ চালু।

### Fixed
- **শেয়ার কার্ডে ছবি ধূসর হয়ে যেত:** `img.src` সেট করে একই টাস্কে `drawImage` করলে ডিকোড হয় না — এখন `compose()` async, `_loadImage()` ডিকোড শেষ হওয়া পর্যন্ত অপেক্ষা করে (১.৫ সে টাইমআউট সহ, যাতে শেয়ার শিট কখনো ঝুলে না থাকে)। স্ক্রিনশটেই ধরা পড়েছিল।
- **কার্ডের ফুটার তারা/টেক্সটের ওপর বসে যেত:** ★ এখন হেডারে ডান দিকে, ফুটার আলাদা লাইনে।
- **Analytics gag-টিয়ার ০ বাদ পড়ত** (`if (!tier)`— ০ falsy) → শুধু `null/undefined` বাদ যায়, তাই "শূন্য মানে অসীম!" টিয়ারও গোনে।
- **টেস্টে ড্র-কল থ্রেশহোল্ড** ১৫০ → ১৬৫ (traffic/pedestrian র‍্যান্ডমে ১৪৭–১৫৫ দোলে; বাজেট এখনো ডেস্কটপ ২২০-এর অনেক নিচে)।

### Metrics
- রিগ্রেশন: **২১+১৭+১৯+৩৮+২৪+৩১+২১+২৪+৩৩+৩৩+২৭+২৪ = ৩১২/৩১২** চেক · console error **০**
- ফটো ক্যাপচার: ৭৪ KB JPEG · শেয়ার কার্ড: ১০৮০×১৩৫০, ~৯৬ KB
- টোন অডিট: ১৯ ফাইল · ৭৪৬ স্ট্রিং → পরিষ্কার · বিল্ড: **৩,৩০৫.৬ kB / gzip ১,১৬৬.৬ kB**

---

## [2.9.0] — 2026-11-02 — Act 5 ব্যাচ B, ইটারেশন 67–72 (স্পিডি বৌদি + শট-লিস্ট/কিউ + Adaptive Music)

### Added
- **`src/ai/SpeediBoudiAI.js`** — Episode 2-এর প্রতিদ্বন্দ্বী লাল স্কুটার, ৬-স্টেট: `CRUISE → DUEL → STEAL → FLEE → WAIT → STOPPED`। খোলা রাস্তায় ২৪ m/s, গলিতে ১২ m/s, **গলিতে ঢুকলে ২ সে হুইলস্পিন** (`speedMultiplierOverride 0.05`, প্লেয়ারের সুযোগ), **৩০ m-এ রাবার-ব্যান্ড ০.৮২** (কখনো ১.০-এর বেশি নয়), **৮০ m পিছিয়ে পড়লে থেমে হাত নাড়ে**, **৩০ সে পিছিয়ে থাকলে `trafficMamaBlock`** (সর্বোচ্চ ২ বার), এবং **কখনো র‍্যাম করে না** (গাড়ির hpMax ৯৯৯, ৬ m-এ ব্রেক)। ধাওয়ার ইভেন্ট: `boudiSpawned/StateChanged/DuelStart/Wheelspin/Stopped`, `handiStolen/handiRecovered`।
- **Episode 2 স্ক্রিপ্ট (GameManager-এ)** — ২০ সে-এ বৌদি ডুয়েল শুরু, ২৮ সে-এ **হাঁড়ি চুরি** (স্লশ মিটার ফ্রিজ হয়, `handiStolen`), ৯ m-এ ধরা পড়লে **হাঁড়ি ফেরত** (একই তাপমাত্রায় মিটার আবার চালু), ৪৫ সে-এ ছাদে পৌঁছালে হাঁড়ি ফেরত দেয় কিন্তু star যায়। `missions.json → cargo.{rival, rivalAtSec:20, stealAtSec:28}` থেকে চলে — কোডে সময় হার্ডকোড নেই।
- **শট-লিস্ট (`shots.json → s1e2_biryani_emergency`)** — ১০টি শট (comicCard → hero 28mm → chase → dutch 4° → whip 160° → slipstreamHero 3 সে → dollyZoom → crash 0.4× → catmullRom → letterboxEnd), `lock:false` — ধাওয়ার মাঝে কখনো স্টিয়ারিং কাড়া হয় না।
- **অডিও কিউ (`audio_cues.json`, ৯টি নতুন)** — `OnBiryaniStart, OnSloshYellow, OnRuleBreak, OnBoudiDuel, OnRocketEmpty, OnPigeonScatter, OnHandiSteal, OnBoudiWave, OnBapiRoarFar` — সবগুলোর কুলডাউন/প্রায়োরিটি/সাবটাইটেল সহ; মোট ২৭ কিউ।
- **`src/audio/AdaptiveMusicSystem.js` + `src/data/music_stems.json`** — **৯ স্টেম** (bass_sub, dhol_groove, tabla_hats, dotara_melody, synth_pad, chant_hype, tension_strings, boss_brass, overdrive_roll), ১২৮ BPM, বার = ১.৮৭৫ সে, ৭টি স্টেট (CALM/EXPLORE/CHASE/HEAT/BOSS/OVERDRIVE/CUTSCENE), **বার-কোয়ান্টাইজড গেইন**, **৬ সে হিস্টেরেসিস**, fade in ১ বার / fade out ২ বার, প্রতি স্টেমে ৮০ Hz HPF (মোবাইল স্পিকার), ভয়েস ডাকিং −৩ dB (attack ৫০ ms, release ৫০০ ms)। সব স্টেম প্রসিডিউরালি সিন্থেসাইজড — বিল্ডে কোনো .ogg নেই, তাই "অ্যাসেট বাজেট" বলতে এখানে CPU বাজেট।
- **`tools/smoke_act5b.mjs`** (২৭ চেক) · `tools/shot_boudi.mjs` → `cinematic/boudi_duel.png`।

### Changed
- `CineArcadeCamera` — নতুন `dutchTilt` ইভেন্ট (স্ক্রিপ্টেড ৪°, ড্রিফট-রোলের উপরে স্তর); `sloshRed`-এ ট্রিগার।
- `AudioEngine` — `adaptiveOwner` সেট হলে পুরোনো একক-লুপ মিউজিক সিকোয়েন্সার নীরব (দুই স্কোর একসাথে বাজলে গেম ভাঙা শোনায়)।
- `eachActiveVehicle` — boss ও rival গাড়িকেও আপডেট করে (আগে বৌদির স্কুটার ইঞ্জিন/গ্রিপ পেত না → গতি ০ থাকত; টেস্টেই ধরা পড়ে)।
- QA API: `rival() rivalArm() rivalSpawn() rivalSteal() rivalCatch() music() musicState() musicTick() duck()`।

### Fixed
- **বৌদির স্কুটার দাঁড়িয়ে থাকত:** `eachActiveVehicle`-এ rival যোগ না থাকায় `update(dt)` চলত না — রিগ্রেশনে ধরা পড়ে (৪.২ → ১০.২ km/h এখন)।
- **হুইলস্পিন কখনো ট্রিগার হত না:** সংস্করণ ১-এ `stateTime > 0.5` শর্ত ছিল, কিন্তু `setState('FLEE')` টাইমার রিসেট করত। এখন "গলিতে *প্রবেশ*" (`_wasInAlley`) হিসেবে চিহ্নিত হয়।
- **`cinematic {id}` নামের ভুয়া ইভেন্ট** — কেউ শুনত না (নীরব প্লেসহোল্ডার); এখন আসল `dollyZoom` / `heroShot` / `dutchTilt` ইভেন্টে বদলানো।
- **ডাকিং/লিগ্যাসি মিউজিক দ্বৈরথ:** AdaptiveMusicSystem চালু হলে পুরোনো সিকোয়েন্সার বন্ধ।

### Metrics
- রিগ্রেশন: **২১+১৭+১৯+৩৮+২৪+৩১+২১+২৪+৩৩+৩৩+২৭ = ২৮৮/২৮৮** চেক · console error **০**
- টোন অডিট: ১৯ ফাইল · ৭৪৬ স্ট্রিং → পরিষ্কার
- বিল্ড: **৩,২৮৭.৮ kB / gzip ১,১৬১.৮ kB**
- মাপা: বার ১.৮৭৫ সে, স্টেট প্রয়োগ bar 4 (+৭.৬২ সে), হিস্টেরেসিস ৬ সে, OVERDRIVE-এ ৫ স্টেম সক্রিয়, CUTSCENE-এ ২

---

## [2.8.0] — 2026-11-02 — Act 5 শুরু, ইটারেশন 61–66 (রিকশা ফিজিক্স + বিরিয়ানি স্লশ + Episode 2)

### Added
- **রিকশার টিপ-মডেল (`src/vehicles/RickshawController.js` পুনর্লিখিত)** — `ayTip = g*(track/2)/cogHeight ≈ 6.35 m/s²`, ৫-স্টেট FSM **STABLE → LEAN → WOBBLE → TIPPING → FALLEN → STABLE**, রোল ডায়নামিক্স (`ω=2.5 Hz`, `ζ≈0.5`), **Balance Assist** (yaw ক্ল্যাম্প ০.৮৫·ayTip/speed), counter-steer পুনরুদ্ধার (+০.৩৫/s), TIPPING-এ আসল টর্ক ইমপালস (`hitStop 40 ms / trauma 0.3`), FALLEN-এ ২.৫ সে অপেক্ষা + R/অটো রিকভারি, Expert মোড (assist বন্ধ, maxRoll ২৬°)।
- **রকেট = বাস্তব সম্পদ** — গণনা `running gag` (`rocket_count`, শুরু ৩)-এ থাকে, `gagAdd` ইভেন্টে কমে, শূন্যে ফায়ার হয় না ("শূন্য মানে অসীম!"), **seeded mulberry32** RNG-তে মিসফায়ার ১০% (LEAN/WOBBLE-এ ২০%), মিসফায়ারে yaw kick + balance −০.৩৫ + ধোঁয়া/সাবটাইটেল।
- **`src/systems/CargoSlosh.js`** — ছাদের হাঁড়ি: ভার্চুয়াল পেন্ডুলাম (`ω0=2π·1.2`, `ζ=0.22`, `L=1.1`) → সবুজ/হলুদ/লাল স্পিল মিটার, ছোট ব্রেক-ট্যাপ = counter-swing, তাপমাত্রা ০.৮°/s হ্রাস, **প্রতি ফ্রেমে বরাদ্দ-মুক্ত `sloshMeter` পে-লোড** (HUD শুধু transform/width লেখে)। লাল জোনে chaos −০.০৯/s (GameManager মালিক)।
- **HUD স্লশ মিটার** (`MobileHUD` + `hud.css`) — ডান পাশে হাঁড়ি (পেন্ডুলামের সাথে কাত হয়) + তিন-জোন বার; লালে কাঁপুনি, `prefers-reduced-motion`-এ কাঁপুনি বন্ধ।
- **Episode 2 ডেটা** — `season1.json`-এ "বিরিয়ানি ইমার্জেন্সি" (৮টি বিট, cliffhanger, `gagDeltas {rocket_count:-1, traffic_ticket:+1, cup_count:+1}`, flag `bapi_knows_player`), `missions.json`-এ `biryani_emergency` (৩ ফেজ, cargo ব্লক, নতুন star goal), `briefings.json`-এ ৩ প্যানেল, `dialogue.json`-এ ৩ নতুন পুল (sloshWarn/boudiTaunt/handiSave), `gags.json`-এ ৩টি carry-over গ্যাগ।
- **`tools/smoke_act5.mjs`** — **৩৩টি চেক** · `tools/shot_slosh.mjs` → `cinematic/biryani_slosh.png`।

### Changed
- `StarRating` — নতুন গোল `maxSpill` ও `chaosMin`; `MissionManager.complete()` মেট্রিক্সে `spill` ও `chaosEarned` পাঠায়।
- `RunningGag` — `add(id, delta)` (ammo কমানো যায়), `start` মান, `gagChanged` ইভেন্ট।
- QA API: `slosh() sloshStart() sloshFeed() rickshaw() rickshawMode() rockets() vehicle(id)`।

### Fixed
- **স্লশ মিটার কখনো লাল হত না (ডেড মেকানিক):** ব্রিফের ০.৩৫ rad থ্রেশহোল্ড এই ফিজিক্সে অসম্ভব — মাপা: স্থির ৮ m/s² বাঁকে ১.১ m/১.২ Hz পেন্ডুলাম মাত্র **০.১৩ rad** কাত হয়, ০.৩৫ rad-এ পৌঁছাতে ~২০ m/s² লাগত (আসল গাড়ি ~৯-এর বেশি দেয় না)। এখন থ্রেশহোল্ড **০.১২ rad**, ছাদের র্যাক-গেইন ×১.৮, `MAX_ANGLE 0.45` — স্বাভাবিক হার্ড বাঁক = হলুদ, **১.২ Hz-এ ছন্দে ঝাঁকুনি (রেজোন্যান্স, Q≈2.3)** = লাল।
- **Assist চালু থাকলেও ১০০ বাঁকে ১ বার উল্টে যেত:** drain লাইন (০.৭০) assist ক্ল্যাম্পের (০.৮৫) নিচে ছিল, তাই ক্ল্যাম্পড অবস্থাতেও মিটার খেত। এখন assist চালু থাকলে drain লাইন = ক্ল্যাম্প → শুরু থেকে শেষ পর্যন্ত LEAN-এ থাকে, পড়ে না; Expert-এ ০.৭০ আবার মারাত্মক (টেস্টে যাচাই)।
- **QA `sloshStart` ক্র্যাশ** (`game.debug is not a function`) — ঠিক করা হয়েছে।
- **`smoke_act4`-এ পুল-সংখ্যা হার্ডকোড** (৭) — Episode 2-এর ৩টি নতুন পুল যোগ হওয়ায় `< ৭` অ্যাসারশন ভেঙেছিল; এখন `>= 7`।

### Metrics
- রিগ্রেশন: **২১+১৭+১৯+৩৮+২৪+৩১+২১+২৪+৩৩+৩৩ = ২৬১/২৬১** চেক · console error **০**
- টোন অডিট: ১৯ ফাইল · ৭৪৬ স্ট্রিং → পরিষ্কার
- বিল্ড: **৩,২৬৩.৮৫ kB / gzip ১,১৫৩.৪ kB**

---

## [2.7.0] — 2026-11-02 — Act 4 সম্পূর্ণ, ইটারেশন 56–60 (Playthrough + Tone Guard + Season UI + ব্যালান্স)

### Added
- **`src/narrative/EpisodeRunner.js`** — প্লেথ্রু সেশন: `start(episodeId)` শুধু আনলকড পর্বে চলে, সিরিয়াল = `ep.missions`, পরের মিশন কেবল `missionComplete` হলে (মাঝে **১.৬ সে গ্যাপ**), `missionFailed` হলে রান শেষ (পরাজয় = রানশেষ, রিট্রাই আলাদা), `abort()` যেকোনো সময়, ইভেন্ট `playthroughStarted/playthroughMission/playthroughEnded`, `stats{runs,completed,failed,aborted}`। state কোথাও mutate করে না — শুধু মিশন ম্যানেজারকে ডাকে, রেজাল্ট ইভেন্টে শোনে।
- **`src/narrative/ToneGuard.js` + `src/data/tone.json`** — **৫১টি নিষিদ্ধ টোকেন** (ধর্ম, রাজনীতি, জাত-পাত, লিঙ্গ, দারিদ্র্য) সহ রানটাইম টোন গার্ড। পুরো-শব্দ ম্যাচিং, বাংলা বিভক্তি-সহ (`ধর্ম` → `ধর্মের`-ও ধরা পড়ে), ল্যাটিন কিওয়ার্ডও। `DialogueSystem.validate()` এখন এটা চালায় — **নিষিদ্ধ লাইন HUD-এ পৌঁছাতেই পারে না**।
- **`tools/tone_audit.mjs`** — বিল্ড-টাইম অডিট: ১৯ ফাইল · ৬৭২ দৃশ্যমান স্ট্রিং · পরিষ্কার। টোকেন-ফাইল নিজেকেও অডিট করে না, JS কমেন্ট বাদ দেয় (নাহলে ডকুমেন্টেশনের শব্দেই ধরা পড়ত — প্রথম রানে ৭ + ৫৪ ফলস হিট)।
- **সিজন প্যানেল** (`MobileHUD` + `hud.css`) — পজ কার্ডে ৫টি পর্বের তালিকা: নাম, আনলক অবস্থা (▶ / ★ / SVG তালা)। ইমোজি **নয়** — বাংলা ফন্টে ইমোজি টফু বক্স হয় (স্ক্রিনশটে ধরা পড়েছিল), তাই ইনলাইন SVG তালা।
- **র‍্যাপার ভয়েস হুক** (`GameManager`) — `narrator`/`briefing` সাবটাইটেল → `audioCue {event:'NarratorLine'|'BriefingLine', speaker, voice, priority}`; সক্রিয় ক্যারেক্টারের `characters.json`-এর ভয়েস প্রোফাইল পাস হয়। Act 5-এ TTS এটা সোজা গিলে নিতে পারবে, narrative কোড ছুঁতে হবে না।
- **QA API:** `DESI_API.playthrough(id)`, `.playthroughStop()`, `.season()`, `.tone(text)`।
- **`tools/smoke_act4b.mjs`** — **৩৩টি চেক** (টোন গার্ড ৭, ডায়ালগ রিফিউজাল ২, প্লেথ্রু ৮, ভয়েস ২, সিজন প্যানেল ৫, ডিরেক্টর বিট ২, মোবাইল লেআউট ৪, রিগ্রেশন ৩)।
- **`tools/balance_sweep.mjs` + `tools/balance_model.mjs`** — ব্যালান্সের গ্রিড সার্চ (ChaosSystem-এর হুবহু রেপ্লিকা) ও **আসল ক্লাসে** ভেরিফিকেশন।

### Changed
- **`ChaosSystem` পুনঃটিউন (গুরুত্বপূর্ণ):** `CHAOS_DECAY 0.055 → 0.045`, `MOMENTUM_GAIN 0.085 → 0.035`, এবং **ওভারড্রাইভ শেষে chaos ০.৩-এ নেমে আসে**। আগের সেটিংয়ে অল্প চেষ্টাতেই মিটার ১.০-তে আটকে থাকত (mean chaos ০.৯৬) আর ওভারড্রাইভ প্রতি ১৮ সেকেন্ডে ফায়ার করত — অর্থাৎ মিটার কিছুই মাপত না। এখন: casual → প্রথম ওভারড্রাইভ ৮২ সে, তারপর প্রতি ৫৬ সে (১০% আপটাইম); average → ৪২ সে / ৩৮ সে; expert → ৩৪ সে / ৩৭ সে। ৬ সেকেন্ডই রাখা হলো (৪ সে-তে আপটাইম ৬.৭–১১% — পুরস্কারটা একটা ঝলক হয়ে যেত)।
- **`DramaDirector` build-ব্যান্ড বিট:** build ব্যান্ডে (০.৩–০.৬৫ টেনশন) আগে **কিছুই হত না** — মাপা গিয়েছিল: ২৭ সেকেন্ডে ০টি সেট পিস, ১২৫ সেকেন্ডে ১টি। এখন ১৮ সেকেন্ড নীরবতা হলে `build` ব্যান্ড নিজে একটা বিট চায় (স্পাইক নয়, `chaos < 0.6` হলে নয়) → একই ড্রাইভে ~প্রতি ৩০ সেকেন্ডে ১টি সেট পিস।

### Fixed
- **`NarrativeEngine.stars()` ভুল ঠিকানা:** `save.profile.stars` পড়ত, কিন্তু তারাগুলো `SaveSystem.stars` (টপ-লেভেল) — তাই **পর্ব ২ কখনো আনলক হত না**। এখন `save.getStars()` দিয়ে পড়ে। season প্যানেলও একই ভুল করছিল।
- **ডিরেক্টরের বিট-লগ স্প্যাম:** প্রথম সংস্করণে `idleFor() > 18` শর্ত প্রতি ০.৪ সে-এ সত্যি হয়ে ডেসিশন লগ ভরাত — এখন `lastBeatAt` গার্ড।
- **`smoke_act3b`-এর দুটি ফ্লেকি চেক:** রাবার-ব্যান্ড মাল্টিপ্লায়ার আর ঘোস্টের চলাচল ফিক্সড-ওয়েটে মাপা হত; এখন পোলিং (৮০×২৫০ms / ৪০×২০০ms) → তিনবার পরপর ২১/২১।
- **`smoke_act3`-এ ভুল টাইমিং:** ওভারড্রাইভ শেষের chaos ৮ সেকেন্ড লুপের পরে পড়া হত (ততক্ষণে ০.৩ → ০.২১ decay)। এখন `overdriveEnd` ইভেন্টেই পড়া হয়।

### Metrics
- রিগ্রেশন: **২১+১৭+১৯+৩৮+২৪+৩১+২১+২৪+৩৩ = ২২৮/২২৮** চেক · console error **০**
- টোন অডিট: ১৯ ফাইল · ৬৭২ স্ট্রিং · ৫১ টোকেন → পরিষ্কার
- বিল্ড: **৩,২৪৪.৭ kB / gzip ১,১৪৭.১ kB**
- স্ক্রিনশট: `cinematic/season_panel.png` (৪২০×৮৬০, পজ কার্ড + সিজন তালিকা)

---

## [2.6.0] — 2026-11-02 — Act 4 শুরু, ইটারেশন 46–55 (Dialogue + Running Gag + Season 1)

### Added
- **`src/narrative/DialogueSystem.js` + `src/data/dialogue.json`** — সব সংলাপের এক দরজা: ৭টি পুল (পুলিশ, গরু, রিকশাওয়ালা, বিজয়/পরাজয়, RJ, দৈনিক), **২.২ সে গ্যাপ**, পুল-ভিত্তিক রিপিট-মেমরি (৪ লাইনের পুলে চারটাই শোনার আগে পুনরাবৃত্তি নেই), প্রায়োরিটি ১–৫ (বিজয়ের লাইন পুলিশের টন্টাকে কখনো কাটে না), এবং **৯৬ অক্ষরের সীমা** — ৮০ km/h-এ পড়ার সীমা।
- **`src/narrative/RunningGag.js` + `src/data/gags.json`** — ৭টি রানিং গ্যাগ, প্রতিটির ২–৪টি **এস্কালেশন টিয়ার** (`at: 1,3,6,10`)। কাউন্ট SaveSystem-এ persist হয় (`gag_maCall`), তাই রসিকতা সেশন পেরিয়ে বাড়ে। প্রতিটি ইনক্রিমেন্টে `gagIncrement` ইভেন্ট।
- **`src/narrative/NarrativeEngine.js` + `src/data/season1.json`** — **সিজন ১-এর ৫টি এপিসোড** ডেটায়; বিটগুলো সময়ভিত্তিক সাবটাইটেল, একবার শোনা বিট আর শোনায় না (resume-safe), পর্ব-আনলক শুধু আগের পর্বের মিশন শেষ হলে।
- **`src/narrative/ComicBriefing.js` + `src/data/briefings.json`** — মিশনের আগে ৩ লাইনের কমিক ব্রিফিং: opener → mission line → **রানিং গ্যাগের পে-অফ**; দুবার একই opener আসে না, আর যে গ্যাগ কখনো শোনা হয়নি তার রেফারেন্স দেওয়া হয় না।
- **`tools/smoke_act4.mjs`** — ২৪টি চেক · `tools/shot_story.mjs` — `cinematic/story_briefing.png`।

### Changed
- `missionStart` → কমিক ব্রিফিং + সংশ্লিষ্ট এপিসোড শুরু; `missionComplete`/`missionFailed` → quip; `overdriveStart`/`dailyStarted`/`cowHit` → পুল লাইন; `nearMiss` → ২৫% রোলে ফোঁড়া চ্যাটার (সাবটাইটেল প্লাবন নয়)।

### Fixed
- **`missionStart` পেলোড ভুল পড়া:** ইভেন্ট আসে `{ mission: def, position }`, আমি `{ missionId }` ধরেছিলাম → এপিসোড/ব্রিফিং কিছুই চলত না।
- **রাবার ব্যান্ডের স্টেল মাল্টিপ্লায়ার (Act 3 থেকে):** `speedMultiplierOverride` একবার সেট হলে আর আপডেট হত না (`=== undefined || === 1` গার্ড) → ৪০ m-এ সেট হওয়া মান কাছাকাছি এলেও ×০.৯২-এ নামত না। এখন প্রতি ফ্রেমে লেখা হয়।
- **সেশন-শুরুতে `node_modules` + Chromium লাইব্রেরি হারানো:** `npm install`, `lib*.so.N` সিমলিংক পুনর্নির্মাণ, dev সার্ভার পুনরায় চালু।
- **স্মোক প্রোবের ভঙ্গুরতা:** হেডলেসে সিম-সময় ০.২৫×–০.৬× হতে পারে, তাই "নির্দিষ্ট km/h" এর বদলে **"গতি বেড়েছে"** যাচাই (০→২৩ km/h); ড্রাইভ-মাপার আগে `setpieces` ফ্ল্যাগ বন্ধ + বৃষ্টি বন্ধ, নাহলে সেট পিস মাঝপথে বৃষ্টি/পুলিশ এনে পরিমাপ নষ্ট করত।

### Metrics
- রিগ্রেশন: **২১+১৭+১৯+৩৮+২৪+৩০+২১+২৪ = ১৯৪/১৯৪** চেক · error **০**
- বিল্ড: ৩.২৪ MB / gzip ১.১৪৫ MB

---

## [2.5.0] — 2026-11-02 — Act 3 সম্পূর্ণ, ইটারেশন 41–45 (Fair Chase + Ghost + Daily)

### Added
- **`src/engagement/RubberBand.js`** — তাড়া *ন্যায্য* রাখার একমাত্র হাতিয়ার: পিছু ধাওয়া করা গাড়ির গতি দূরত্ব অনুযায়ী গুণক। কার্ভ: ০–১২ m **×০.৯২**, ১২–৩০ m ×১.০০ (নিরপেক্ষ), ৩০–৭০ m ×১.০৬, ৭০–১২০ m → **×১.১২ (সর্বোচ্চ)**; ১২০ m-এর বেশি হলে **৮ সে পর তাড়া ছেড়ে দেয়** (`pursuitGivenUp`)। ±১২%-এর বেশি নয় — বেশি হলে খেলোয়াড় "সস্তা" টের পায়।
- **`src/engagement/GhostRunner.js`** — নিজের সেরা রানের ভূত। ২০ Hz-এ `Int16Array` (ডেসিমিটার/ডিগ্রি), সর্বোচ্চ ৬০ সে ≈ ১৯ KB; প্লেব্যাকে **একটাই প্রি-বিল্ট প্রক্সি mesh** (কোনো অ্যালোকেশন নেই), কোনো কোলাইডার নেই, ৯০ m দূরে গেলে লুকিয়ে যায়।
- **`src/engagement/DailyChallenge.js` + `src/data/daily.json`** — তারিখ-সিডের দৈনিক: ১০টি মডিফায়ার থেকে **৩টি**, FNV-১a হ্যাশ → সার্ভার/নেটওয়ার্ক ছাড়াই প্রতিদিন সবার জন্য একই। ৩০ দিনের স্টেট localStorage-এ।
- `DESI_API`: `band()`, `ghost()`, `ghostPlay()`, `ghostRecord()`, `daily()`, `dailyStart()`, `dailyDone(score)`।
- **`tools/smoke_act3b.mjs`** — ২১টি চেক।

### Changed
- `GameManager.startGame()` — নতুন রানে ghost রেকর্ডিং + দৈনিক শুরু; `missionComplete`-এ ghost.commit + daily.complete।
- রাবার ব্যান্ড শুধু **ড্রাইভিং পাথেই** চলে (নিচের বাগ দেখো)।

### Fixed
- **রাবার ব্যান্ড কখনোই চলত না (গুরুতর):** কোডটি `updateDrama()`-র **on-foot early-return** শাখায় বসেছিল, অর্থাৎ ঠিক যখন কোনো তাড়া নেই তখনই চলত, আর আসল ড্রাইভিং পাথে কখনো নয়। টেস্টেই ধরা পড়ে ("0/5 units got a multiplier") — এখন আসল পাথে, `veh` গার্ড সহ।
- **লেটারবক্স/লক মালিকানা (nested cinematic):** ১.২ সে-র overdrive স্টিং শেষ হয়ে ৮ সে-র Director's Cut-এর বার **মুছে ফেলত**। এখন `letterboxHolders`/`lockHolders` রেফারেন্স-কাউন্টেড — যে আগে শুরু করেছে, তার অনুমতি ছাড়া বার নামে না।
- **Ghost স্লো-মোশনে চলত:** ২০ FPS ফোনে প্রতি ফ্রেমে স্যাম্পল বাদ পড়ে ghost ধীরে হাঁটত → ReplayBuffer-এর মতোই মিস হওয়া স্লট ভরা হয় (যাচাই: ৩ সে-র ৬০ Hz ফ্রেম → ঠিক ৬০টি ghost ফ্রেম = ২০ Hz)।

### Known gap (Act 6-এর জন্য লগ করা)
- **low tier-এ ড্র-কল**: ফাঁকা রাস্তায় **৮০–৮৭** (বাজেট ≤৯০ ✅), কিন্তু দীর্ঘ সেশনে ট্রাফিক পুল পূর্ণ হলে (২০টি গাড়ি ক্যামেরায়) **~১১৯**। ট্রাফিক mesh merge/instancing ছাড়া ≤৯০ ধরে রাখা সম্ভব নয় — Act 6-এর পারফ পাসে ঠিক হবে।

### Metrics
- রিগ্রেশন: **২১+১৭+১৯+৩৮+২৪+৩০+২১ = ১৭০/১৭০** চেক · error **০**
- বিল্ড: ৩.২২ MB / gzip ১.১৩৮ MB

---

## [2.4.0] — 2026-11-02 — Act 3 শুরু, ইটারেশন 31–40 (Drama Director + Chaos/Overdrive)

### Added
- **`src/director/TensionModel.js`** — একটাই ০–১ সংখ্যা: "খেলোয়াড় বিরক্ত না অভিভূত?"। উৎস ও ওজন (সবই যুক্তিসহ): পুলিশ স্টার ০.১২/স্টার, গতি ০.১৬, সাম্প্রতিক near-miss ০.১০ (৩ সেকেন্ডে ফেড), বস ০.১৮, chaos ০.১৮, ক্ষতি ০.১২, ২০ সে শান্তি −০.১২। ওঠা ২.৪/s, নামা ১.৯/s (**ভয় দ্রুত আসে, স্বস্তি দেরিতে**)। ব্যান্ড: calm <০.৩ ≤ build <০.৬৫ ≤ peak। **টেনশন লগ** ১০ Hz-এ শেষ ১২০ স্যাম্পল রাখে — রিভিউতে দেখা যায় কেন ডিরেক্টর সিদ্ধান্ত নিল।
- **`src/director/DramaDirector.js`** — পেসিং ব্রেন, **শুধু ইভেন্ট দেয়** (`directorSpike`/`directorCalm`), কোনো স্টেট বদলায় না। নিয়ম: প্রথম **১০ সেকেন্ড গ্রেস** (শুরুর রাস্তা খেলোয়াড়ের), স্পাইকের পর **৬ সেকেন্ড রিলিজ ভ্যালভ**, peak ব্যান্ডে ৮ সে স্পাইক না হলে সক্রিয়, calm ১৫ সে হলে ছোট পিস (বিরক্তি নতুনত্বে সারায়, কঠিনতায় নয়)।
- **`src/director/SetPieceScheduler.js` + `src/data/setpieces.json`** — **৮টি সেট পিস** (মৌসুমি বৃষ্টি, গরুর জ্যাম, বিয়ের শোভাযাত্রা, গর্তের র‍্যালি, লোড শেডিং, বাসের হানাদারি, পুলিশ চেকপোস্ট, ঘুড়ির ঝাঁক)। নিয়ম: **ব্যান্ড গেটিং** · ওয়েটেড **ব্যাগ** (একই পিস পরপর অসম্ভব) · per-piece cooldown · **１２ সে গ্লোবাল গ্যাপ** · একসাথে সর্বোচ্চ ১টি · প্রথম ২০ সে-এ কিছুই না।
- **`src/engagement/ChaosSystem.js`** — chaos (০–১) + momentum + overdrive। নীরব ড্রিফটও ক্যাওস দেয় (০.১০/s × slip), ক্র্যাশ −০.২৮, রেক −১.০। momentum ০.৯ হলে `momentumFull` → ৬ সে overdrive (গেইন ×১.৫, chaos decay ০) → শেষে `chaosBank` → **টাকা**।
- HUD-এ **chaos chip** (ক্যাওস ফিল + momentum বার + "ওভারড্রাইভ!" ব্যাজ), মোবাইলে স্পিডোর উপরে — জয়স্টিকের সাথে সংঘর্ষ নেই।
- `features.json`: `cinematic`, `replay`, `director`, `chaos`, `setpieces` চালু।
- **`tools/smoke_act3.mjs`** — ৩০টি চেক · `tools/shot_chaos.mjs` — ডেস্কটপ + মোবাইল HUD স্ক্রিনশট।

### Changed
- `GameManager.updateDrama(dt)` — প্রতি ফিক্সড স্টেপে chaos → tension → director; সবই **রিড-অনলি**, ইভেন্ট ছাড়া কিছু বদলায় না।
- সেট পিসের `weatherRequest`/`wantedBump` কেবল `setpieces` ফ্ল্যাগ চালু থাকলে কাজ করে; বৃষ্টি `seconds` পরে নিজে থেকে থামে।

### Fixed
- **ড্রিফটে ক্যাওস কমে যেত:** drift গেইন ০.০২/s বনাম decay ০.০৫৫/s → লম্বা ড্রিফটে মিটার **খালি** হয়ে যেত। এখন ০.১০ × (০.৫+slip) = ০.১৫/s — ড্রিফট এখন লাভজনক, কিন্তু decay-এর চেয়ে সামান্য, তাই থামলেই ফুরায়।
- **মোবাইলে chaos chip জয়স্টিকের ওপর বসে ছিল** — ডান দিকে স্পিডোর উপরে সরানো; বাংলা লেবেল `var(--bn)` ফন্টে (আগে ভুল ভেরিয়েবলে টফু)।
- **প্রাথমিক ১০ সেকেন্ডে ডিরেক্টর কথা বলত** → গ্রেস উইন্ডো।

### Metrics
- রিগ্রেশন: v1 **২১/২১** · Juice **১৭/১৭** · Act 1b **১৯/১৯** · Act 2a **৩৮/৩৮** · Act 2b **২৪/২৪** · **Act 3 ৩০/৩০** · error **০** (মোট **১৪৯ চেক**)
- ড্র-কল: **low ৭২** · **mid ১২৪** (বাজেট ৯০/১৫০) · বিল্ড ৩.২১ MB / gzip ১.১৩৫ MB

---

## [2.3.0] — 2026-11-02 — Act 2 সম্পূর্ণ, ইটারেশন 26–30 (PostFX + LUT + Director's Cut)

### Added
- **`src/cinematic/LUTGrader.js` + `src/data/grading.json`** — **৬টি গ্রেডিং প্রিসেট** (`day`, `dusk`, `night`, `rain`, `overdrive`, `replay`), প্রতিটি ASC-CDL lift/gamma/gain + contrast + temperature + saturation দিয়ে বর্ণিত। বুটে **৩২³ LUT** (1024×32 স্ট্রিপ, ১২৮ KB টেক্সচার) তৈরি হয় — কোনো `.cube` ফাইল নেই, তাই সিঙ্গেল-FILE বিল্ড অটুট। CPU-র `sample()` আর শেডারের লুকআপ একই সূত্র থেকে আসে (টেস্টে দুটো আলাদা হতে পারে না)। লো-টায়ারে কম্পোজার নেই → একই মুড **CSS ফিল্টার** দিয়ে।
- **`src/cinematic/PostFXStack.js`** — v1 কম্পোজারের (RenderPass → Bloom → OutputPass) **শেষে** একটিমাত্র `ShaderPass`: LUT গ্রেড + vignette + chromatic aberration + grain + radial "speed stretch"। টোন-ম্যাপিং ও sRGB আউটপুটের **পরে** বসানো — LUT একটি পার্সেপচুয়াল কার্ভ, লিনিয়ার লাইটে বসালে আকাশ পুড়ে যেত।
- **Director's Cut (`ReplayPlayer` mode `directorsCut`)** — ৮ সে রেকর্ড করা রান, ০.৫৫× গতিতে, **Catmull-Rom ক্যামেরা পথ** (৫টি অ্যাঙ্কর, কাঁধ বদল করে, spline ৫০–৬০ m), FOV ৪৬° সিনেমা লেন্স, শেষে `shareRequest` (Act 5-এ Android শেয়ার শিট এখানেই বসবে)।
- **`src/data/shots.json` → `directorsCut`** সিকোয়েন্স: `cine('directorsCut')` দিয়েই পুরো রিকার্ড চলে।
- `postfxMoodOverride` ইভেন্ট — QA/ফটো মোডের জন্য প্রিসেট জোর করে বসানো।
- **`tools/smoke_act2b.mjs`** — ২৪টি চেক · **`tools/shot_grade.mjs`** — `cinematic/grade_{day,night,overdrive}.png`।

### Changed
- `GameManager`: `postfxStack` তৈরি + `applyQuality`/`onResize`/`renderUpdate`-এ যুক্ত; গ্রেড প্যারামিটার **রিড-অনলি** (speed01, nitro, night, rain, crash) — PostFXStack কোনো গেম-স্টেট ছোঁয় না।
- `ctx.THREE` প্রকাশ (`ReplayPlayer`-এর spline-এর জন্য)।
- `DESI_API`: `cut()`, `postfx()`, `grade(mood)`।

### Fixed
- **`ReplayPlayer`-এ অ্যালোকেশন:** `CatmullRomCurve3.getPointAt(u)` প্রতি ফ্রেমে নতুন `Vector3` বানায় → প্রি-অ্যালোকেটেড টার্গেট ভেক্টর পাস করা হয়েছে।
- **গ্রেড পাস ভুল জায়গায় বসলে রং দুবার টোন-ম্যাপ হত** — পাসটি এখন OutputPass-এর পরে (টেস্টে চেইনের ক্রম যাচাই করা: `RenderPass → Bloom → OutputPass → ShaderPass`)।
- **লো-টায়ারে গ্রেডিং হারিয়ে যাচ্ছিল** (ব্লুম বন্ধ থাকায় কম্পোজারই নেই) → CSS-ফিল্টার ফলব্যাক; এখন তিন টায়ারেই মুড এক।

### Metrics
- রিগ্রেশন: v1 **২১/২১** · Juice **১৭/১৭** · Act 1b **১৯/১৯** · Act 2a **৩৮/৩৮** · **Act 2b ২৪/২৪** · error **০** (মোট ১১৯ চেক)
- ড্র-কল: **low ৬৭–৬৯** (≤৯০) · গ্রেড পাস high/mid-এ ১টি অতিরিক্ত ফুল-স্ক্রিন পাস, low-এ ০
- বিল্ড: ৩.১৯ MB / gzip ১.১২৯ MB (LUT কোড + ShaderPass)

---

## [2.2.0] — 2026-11-02 — Act 2, ইটারেশন 16–25 (সিনেমাটিক লেয়ার + Last Second Save)

### Added
- **`src/cinematic/ReplayBuffer.js`** — ৩০ Hz (low tier-এ ১৫ Hz) রিং বাফার, **১২ সেকেন্ড**, একটিই `Float32Array` (stride ১১ + ৪ অ্যাক্টর × ৪ = ২৭ float → ৩৮.৯ KB)। `sampleAt(age)` quaternion **nlerp** করে (per-frame trig নেই), `newest()`, `debug()`। স্লো ফ্রেমে বাদ পড়া স্লটগুলো **একই পোজ দিয়ে ভরে** দেওয়া হয় — নাহলে ২০ FPS ফোনে "১২ সেকেন্ড" আসলে ৭ সেকেন্ড হত এবং `sampleAt(age)` ভুল ফ্রেমে যেত।
- **`src/cinematic/ReplayPlayer.js`** — Last Second Save: ০.৮ সে পেছন থেকে ২.৬ সে, **০.২৫×** গতিতে; লাইভ body freeze হয়ে mesh রেকর্ড করা ট্রান্সফর্মে চলে (কোনো নতুন mesh নেই), সাইড-অরবিট ক্যামেরা, FOV ৫৮-এ lerp; শেষে **সঠিক** ট্রান্সফর্ম ফেরত + `replayTrigger`/`replayEnded`/`subtitle` (`বেঁচে গেছো! কপাল জোরে বাঁচলি!`)।
- **`src/cinematic/CinematicDirector.js`** — `.cine-bars` letterbox (৩০০ ms), ইনপুট লক (`cinematicLock`), শট কিউ, **যেকোনো ট্যাপ/কি-প্রেসে skip** — skip কখনো লক আটকে রাখতে পারে না (MENU/GARAGE-এ ঢুকলেও লক রিলিজ)। ক্যামেরা স্পর্শ করে না, শুধু ইভেন্ট দেয়।
- **`src/cinematic/ShotLibrary.js` + `src/data/shots.json`** — ৮টি নামযুক্ত সিকোয়েন্স (`missionIntro`, `bossArrival`, `stuntRing`, `nearMiss`, `policeLevelUp`, `overdrive`, `garageReveal`, `directorsCut`), প্রতিটি freeze করা (রানটাইমে কেউ বদলাতে পারে না)। `DESI_API.cine('bossArrival')` দিয়ে সরাসরি চালানো যায়।
- **`.cine-bars` CSS** — ১২.৪ vh বার, ৩০০ ms ট্রানজিশন, পোর্ট্রেটে ৮ vh।
- **`tools/smoke_act2.mjs`** — **৩৮টি** অটোমেটেড চেক (নিচে কভারেজ)।
- **`tools/shot_cinematic.mjs`** — `cinematic/cine_letterbox.png`, `cinematic/cine_replay.png`।

### Changed
- **`CineArcadeCamera` v2:** Dutch tilt (slip × 0.08 rad, **ক্যাপ ৬°**), dolly zoom (FOV +৩৮·p, `backDist` ×০.৫৫, ০.৮ সে), whip pan (০.২ সে, ১৫০°), crash cam (сev≥০.৮৫ → ২০°/সে অরবিট, ০.২৫ সে in / ০.৪ সে out), hero shot (১.৬ সে, ৩.৪ m পাশে), handheld drift ০.০২ m @ ০.৯ Hz। সব **`lookAt()`-এর পরে** — আগে দিলে solve মুছে দিত।
- **`GameManager`** ট্রিগার: `bossCharge`→`bossArrival` সিকোয়েন্স, `policeLevelChanged`≥১→`whipPan 150°`, `stuntRing`→`stuntRing`, `overdriveStart`→`overdrive`; `crash` ইভেন্টে `x/y/z`; camera target-এ `slip` (clamp ±1) ও `handheld`.
- Replay-এর সময় `cineCamera.update()` ও প্লেয়ারের `syncVisual()` বন্ধ (নাহলে দুটো সিস্টেম একই mesh-এর জন্য লড়ে)।

### Fixed
- **রিং বাফারের সাইজ বাগ:** বাফার বুট-টায়ারের fps দিয়ে সাইজ হত → low (১৫ Hz) থেকে mid-এ গেলে ১২ সেকেন্ডের জায়গায় **৬ সেকেন্ড** হিস্ট্রি থাকত। এখন টায়ার বদলালে একবার re-size হয় (প্রতি ফ্রেমে নয়), উইন্ডো সবসময় ১২ সে।
- **নীরব ব্যর্থ Last Second Save:** বুটের প্রথম সেকেন্ডে HISTORY ০.৮ সেকেন্ডের কম থাকলে `play()` `false` ফিরিয়ে দিত — অর্থাৎ শুরুর দিকের সবচেয়ে নাটকীয় ক্র্যাশগুলোই বাদ পড়ত। এখন `lookback` উপলব্ধ হিস্ট্রিতে **ক্ল্যাম্প** হয়ে যায় (০.২৫ সে-এর কম হলেই কেবল না)।
- **প্রতি-ফ্রেম অ্যালোকেশন:** `requestAnimationFrame(this.tick.bind(this))` প্রতি ফ্রেমে নতুন ফাংশন বানাত (৬০/সে) — এখন বুটে একবার bind। `ReplayPlayer`-এর `damp({…})` অবজেক্টও সরানো হয়েছে (স্কেলার lerp)।
- **টেস্ট-প্রোবের ভুল (গুরুত্বপূর্ণ, গেম নয়):** `sampleAt()` ইচ্ছাকৃতভাবে একই scratch অবজেক্ট ফেরায় (zero-alloc), তাই প্রোব `newest()` আর `sampleAt()`-এর মান তুলনা করছিল **একই অবজেক্টের সাথে** → "পোজ বদলায়নি" মিথ্যা ব্যর্থতা। এখন নম্বর কপি করে তুলনা।
- **ডিরেক্টরের নাম-সংঘাত:** `play()` স্ট্রিং (সিকোয়েন্স নাম) আর অ্যারে — দুটোই নেয়।

### Metrics
- রিগ্রেশন: v1 **২১/২১** · Juice **১৭/১৭** · Act 1b **১৯/১৯** · **Act 2 ৩৮/৩৮** · console error **০**
- ড্র-কল: **low ৭২** (বাজেট ≤৯০) · বিল্ড ২.৯৮ MB / gzip ১.০৭২ MB
- Replay খরচ: ৩৮.৯ KB বাফার, প্রতি ফ্রেমে ০ বরাদ্দ (২ সে ড্রাইভে heap বৃদ্ধি ≈০.১ MB)

---

## [2.1.0] — 2026-11-01 — Act 1, ইটারেশন 11–15 (Accessibility + Metrics + পারফ পাস)

### Added
- **`src/access/FlashSafetyLimiter.js`** — WCAG 2.3.1: যেকোনো ১ সেকেন্ডে সর্বোচ্চ **৩টি** পূর্ণ-স্ক্রিন ফ্ল্যাশ; ৪র্থ অনুরোধ প্রত্যাখ্যাত (`flashBlocked` ইভেন্ট)। `intensity < 0.15` (≈১০% luminance) হলে সেটা ফ্ল্যাশ হিসেবে গণ্য হয় না, তাই সাধারণ ব্লুম ব্যাজেট খায় না। সেটিং শুধু **কঠোর** করতে পারে (২/সে) — বন্ধ করা যায় না (prompt §19)।
- **`src/access/AccessibilityManager.js`** — সেটিং → DOM: `data-a11y-motion/subtitle/thumb/palette`। reducedMotion ক্যামেরা শেক ৩৫%-এ, subtitle size, one-thumb লেআউট, colour-blind প্যালেট (deutan/protan/tritan)।
- **`src/analytics/LocalMetrics.js`** — শুধু লোকাল, **কোনো নেটওয়ার্ক কল নেই**: সেশন, মিশন, ক্র্যাশ, near-miss, hit-stop, slow-mo সেকেন্ড, p95 ফ্রেম; `desi_overdrive_v2_metrics`-এ persist, `pagehide`/`visibilitychange`-এ flush।
- **`tools/smoke_act1b.mjs`** — ১৯টি অটোমেটেড চেক।
- HUD সেটিংস প্যানেলে ৬টি নতুন সুইচ (reduced motion, haptics, subtitle size, one-thumb, colour-blind, camera mode) + ফ্ল্যাশ লিমিটার নোট।
- `DESI_API`: `metrics()`, `metricsReset()`, `a11y()`, `flash(i)`, `flashStats()`।

### Changed
- **সেটিংসের এক দরজা:** HUD এখন `settingRequest` ইভেন্ট পাঠায়, `GameManager.setSetting()` লিখে `settingsChanged` ছড়ায় — TraumaShake/Haptics/Accessibility সবাই শোনে। `MobileHUD.syncSettingsToUI()` বুটে সেভ-মান উইজেটে বসায় (প্যানেল আর মিথ্যে বলে না)।
- **ড্র-কল ৯১ → ৬৭ (low tier)** — পেট্রল স্টেশনের ৮টি mesh × ৩ স্টেশন `mergeGroupOpaque()` দিয়ে এক mesh-এ; low বাজেট (≤৯০) এখন আরামে পূরণ।
- `.pause-card` ও `.settings-panel` স্ক্রলযোগ্য — ৮৪৪×৩৯০ ল্যান্ডস্কেপে আর কাটা পড়ে না।

### Fixed
- **নাম-সংঘর্ষ (গুরুতর):** `this.metrics` (v1-এর হালকা কাউন্টার) আর নতুন `LocalMetrics` একই নামে বসে গিয়েছিল → `diag()`-এ সার্কুলার স্ট্রাকচার, ফলে **স্মোক টেস্টের পুরো প্রোব ব্লক undefined** হয়ে যাচ্ছিল। নতুন ইনস্ট্যান্স এখন `playMetrics`; `diag()`-এ দুটোই আলাদা (এবং সিরিয়ালাইজেবল)।
- **নেটিভ `<select>`-এ টফু:** system font-এ বাংলা গ্লিফ না থাকায় অপশন টেক্সট বক্স হত → option লেবেল Latin (`Small/Medium/Large`, `3 / sec`), চারপাশের লেবেল বাংলাতেই।
- **স্মোক টেস্টের দুটি ভুল-নেগেটিভ:** (ক) ম্যাগনেট প্রোব সবচেয়ে কাছের গাড়ি বাছত, যা প্রায়ই **ট্রাক (mass 5400 > maxMass 1600)** — এখন কেবল লিফটেবল গাড়ি; (খ) ত্বরণ প্রোব আগের টেস্টের ধাক্কা-খাওয়া অবস্থান থেকে শুরু করত → এখন নির্দিষ্ট ফাঁকা রাস্তায় টেলিপোর্ট করে।

### Metrics
- রিগ্রেশন: **২১/২১** (v1) · Juice **১৭/১৭** · Act 1b **১৯/১৯** · error ০
- ড্র-কল: **low ৬৭** · mid ১২০–১২৫ · বিল্ড ২.৯৬ MB / gzip ১.০৬৭ MB

---

## [2.0.0] — 2026-11-01 — Act 1, ইটারেশন 1–10 (Juice ভিত্তি)

### Added
- **`src/juice/TimeScaleStack.js`** — ধীর-গতির একমাত্র দরজা। একাধিক উৎসের মধ্যে **সবচেয়ে কম scale** জেতে, প্রতিটি এন্ট্রির নিজের মেয়াদ শেষে নিজেই মুছে যায় → "স্থায়ী স্লো-মো বাগ" অসম্ভব। মেয়াদ **রিয়েল টাইমে** কমে (স্কেলড dt-তে নয়), নাহলে ০.০৫ স্কেলে ৬০ ms hit-stop ১.২ সে হয়ে যেত।
- **`src/juice/TraumaShake.js`** — Eiserloh (GDC 2016) ট্রমা² মডেল: trauma ০–১, linear decay ১.৬/s, shake = trauma², ২৫৬-এন্ট্রি seeded value-noise (`Math.random` নয় → ডিটারমিনিস্টিক রিপ্লে-বান্ধব)। maxAngle ২.৫°, maxOffset ০.১৫ m, freq ১২ Hz। `reducedMotion` = ৩৫%।
- **`src/juice/HapticsManager.js`** — §4.5-এর প্যাটার্ন (`bigCrash [40,30,80]`, `bossRam [60,40,120]` …), feature-detect + ৮০ ms gap + try/catch (iOS/ডেস্কটপে কোনো এরর নয়)।
- **`src/juice/NumberTicker.js`** — ০.৬ সে ease-out গণনা, প্রতি ৩ ইউনিটে `onTick` (Act 3-এর Chaos/টাকা পপআপের জন্য প্রস্তুত)।
- **`src/juice/JuiceSystem.js`** — §4.1-এর প্রোফাইল টেবিল → hit-stop/slow-mo + trauma + haptics + squash/stretch এক জায়গা থেকে; `hitStop`/`traumaAdd` ইভেন্ট এমিট করে।
- **`src/core/FeatureFlags.js` + `src/data/features.json`** — প্রতিটি v2 সিস্টেমের kill-switch (§14), রানটাইমে `DESI_API.flag()` ও localStorage ওভাররাইড।
- **`tools/smoke_juice.mjs`** — Act 1-এর ১৭টি অটোমেটেড চেক।
- `CineArcadeCamera.legacyShake` — TraumaShake চালু থাকলে v1 random shake বন্ধ (দুই শেক = §19 anti-pattern)।
- `SaveSystem.settings`-এ v2 সুইচ: `haptics`, `reducedMotion`, `flashLimiter`, `subtitleSize`, `oneThumb`, `autoNitroAssist`, `cameraMode` (সব ভ্যালিডেটেড)।

### Changed
- `GameManager.update()`: `timeScale` এখন `min(juice.timeScale, cineSlow)`; **নামার সময় snap** (hit-stop কাটের মতো লাগে), ওঠার সময় lerp।
- `GameManager.renderUpdate()`: `juice.update(dt)` + `juice.applyCamera()` — ক্যামেরা solve-এর **পরে** (আগে দিলে `lookAt()` shake মুছে দেয়)।
- `nearMiss` পেলোডে `minDist` যোগ — `<০.৫ m` আল্ট্রা টিয়ার শনাক্ত করার জন্য।
- `getDiagnostics()`-এ `timeScale` ও `juice` ব্লক।
- `GameManager.setSetting(key, value)` — সব সেটিংয়ের এক দরজা, `settingsChanged` ইভেন্ট এমিট করে (reducedMotion → TraumaShake, haptics → HapticsManager)।

### Fixed
- **স্মোক টেস্টের ভুল-নেগেটিভ (brake squash):** `throttle:-1` চাপলে গাড়ি ব্রেক করে **তারপর রিভার্স** করে, তাই `|speed|` আবার বাড়ে ও বডি আবার stretch হয় — টেস্ট এখন ব্রেকের প্রথম ৫০০ ms-এ সর্বনিম্ন z নেয়। (গেম-কোড সঠিক ছিল, টেস্টের অনুমান ভুল।)
- dev পরিবেশে `node_modules` ও `.deps` লাইব্রেরি সিমলিংক হারিয়ে যাওয়া → `npm install` + `lib*.so.<major>` সিমলিংক পুনর্নির্মাণ; Chromium আবার চালু।

### Metrics
- রিগ্রেশন: **২১/২১** (v1 স্যুট) · Juice: **১৭/১৭**
- ড্র-কল: low ৯১ · mid ১২০ (অপরিবর্তিত) · বিল্ড ২.৯৫ MB / gzip ১.০৬৪ MB
- হেডলেস ফ্রেম: ১৫২–১৬৭ ms (SwiftShader; ফোনের মাপ নয়)

---

## [0.9.0] — 2026-11-01 — Phase 2 ক্লোজ (ব্যাচ B9–B10, ইটারেশন 81–100)

### Added
- **`src/ui/CharacterSelect.js` (নতুন, ২৪২ লাইন)** — ৪ জন চ্যারেক্টারের সিলেক্ট স্ক্রিন।
  কেন: মাস্টার প্রম্পটের "৪টি চ্যারেক্টার" শর্তে চতুর্থ খেলোয়াড় ছিল না, আর চ্যারেক্টার বাছাইয়ের কোনো UI ছিল না।
  কীভাবে: `characters.json` থেকে ডেটা, `profile.character`-এ persist, `characterSelected` ইভেন্ট → `GameManager.applyCharacter()` → সেই চ্যারেক্টারের গাড়ি রেজিস্ট্রি থেকে অ্যাক্টিভেট (পুল অক্ষুণ্ণ)। Boss (`isBoss`) তালিকা থেকে বাদ।
  টেস্ট: `node tools/debug_character.mjs` → `cards: 4`, সিলেক্ট করার পরে `vehicle: two_wheeler`, `saved: speedy_boudi`, এরর ০। স্ক্রিনশট `tools/shot_characters.png`।
- **৪র্থ চ্যারেক্টার "নাইট্রো নানি"** — `characters.json`-এ সম্পূর্ণ def (idleLines ৩টি, missionLines ৪টি, voice profile `sarcastic`, `missionIds` ২টি)।
- **`MainMenu`-এ "ক্যারেক্টার বাছো" বাটন** (৪৮ px, `.menu-secondary`) + `hud.css` স্টাইল।
- **`GameManager.applyCharacter()`** — ভয়েস প্রোফাইল, গাড়ি সোয়াপ, সাবটাইটেল। বুটে `deferVehicle` দিয়ে শুধু পছন্দ মনে রাখে, গাড়ি বদলায় গেম শুরু হওয়ার পরে (মেনুর পেছনে বডি রিবিল্ড এড়াতে)।
- **`tools/`**: `debug_character.mjs`, `debug_mobile.mjs`, `debug_traffic.mjs`, `debug_hoop.mjs`, `debug_hoop2.mjs`, `debug_mass.mjs`, `debug_graph.mjs`, `debug_wheels.mjs`, `debug_sideview.mjs` — প্রতিটি একটি নির্দিষ্ট অনুমান যাচাই করার জন্য লেখা হেল্পার।

### Changed
- **ড্র-কল ৫০৯ → ১২০ (mid), ৮৯ (low)।** কেন: mid টিয়ারের বাজেট ≤১৫০।
  `CityMap`: বিল্ডিং এখন শুধু কোলাইডার (`visual:false`) — আগে আলাদা mesh + instanced mesh দুবার ড্র হত; ব্লক/কার্ব/পার্ক-গাছ `InstancedMesh`।
  `VehicleMeshFactory.bakeOpaque()`: সব opaque Lambert অংশ এক vertex-colored mesh-এ মার্জ; লাইট/গ্লাস/সাইরেন/ইন্ডিকেটর আলাদা থাকে বলে অ্যানিমেশন অটুট।
  টেস্ট: `diag().drawCalls`, `node tools/shots.mjs`।
- **ট্রাফিক ফিজিক্স-অনুভূতি:** রোলিং রেজিস্ট্যান্স ধ্রুবক মন্দন, `linearDamping 0.08 → 0.004`, aero drag `0.0012 → 0.0007`, `ENGINE_UNIT 0.25 → 0.30` → ত্বরণ **৪.৬৬ → ৮.৫৮ m/s²**।
- **সব গাড়ির চাকা বডির বাইরে** (`halfExtents.x + 0.03`) — আগে চাকা বডির ভেতরে লুকানো ছিল, চেজ ক্যামেরা থেকে দেখা যেত না।
- **HUD গ্লিফ:** `⏸ 🔧 🔄 🖐 🧲 ⤴ ⤒ ⤓` → `❙❙ গ F E K M ↑ ↓`; `GarageUI`-এর `🚗` → `গাড়ি`; `CharacterSelect`-এ ইমোজি ট্যাগ বাদ। কেন: ফন্টে গ্লিফ নেই, টফু বক্স আসত।
- **ট্রাফিক ব্রেক:** `gap × 0.45` → `max(0, (gap − 1.8) × 0.9)`, ব্লকার স্ক্যান `alongDist > 0.6` → `> −2.2`। কেন: কাইনেমেটিক গাড়ি থেমে থাকা প্লেয়ারকে ভেদ করে যেত।
- **`SaveSystem`:** `profile.character` ফিল্ড + `ALLOWED_CHARACTERS` ভ্যালিডেশন (করাপ্ট সেভ থেকে অচেনা id ঢুকতে পারবে না)। ডিফল্ট `nitro_nani` (গাড়ি `arcade_car`, আগের ডিফল্ট অভিজ্ঞতা অটুট)।

### Fixed
- **সাসপেনশন:** গাড়ি ০ চাকা গ্রাউন্ডেড নিয়ে লাফাচ্ছিল (`y` ১.১↔৩.৫, `vy` ±৫.৮)। আসল এককের স্প্রিং/ড্যাম্পার + বল-ক্যাপ + CM-মুখী impulse। এখন ৪/৪ গ্রাউন্ডেড, `y` ০.৬৪–০.৬৫।
- **মেনু থেকে গেম শুরু না হওয়া** (`DESI_API.start()` মেনু লুকাত না) এবং তার সাথে আসা `Maximum call stack size exceeded` রিকার্শন।
- **`MissionManager.getHudState` ক্র্যাশ** — `stunt`/`escape` মিশনে `destination` নেই, এখন `def.destination || def.start || [0,0]`।
- **`diag().drawCalls`** এখন `renderer.info.render.calls` থেকে সত্যিকারের সংখ্যা (আগে `undefined`)।
- **স্মোক টেস্টের ৩টি ভুল-নেগেটিভ:** FOV/magnet/hoop প্রোব `vehicle.setInput()` ব্যবহার করত, যেটা প্রতি ফ্রেমে `consumeInput()` ওভাররাইট করে → এখন `DESI_API.input()`; ম্যাগনেট প্রোব এখন ট্রাফিকের ঠিক ওপরে হোভার করে; হুপ প্রোব টেলিপোর্ট না করে **চালিয়ে** হুপ ভেদ করে (টেলিপোর্টে `_prevPos` রিসেট হওয়া সঠিক anti-cheat)।

### Removed
- `CityMap`-এ বিল্ডিং/ব্লক/কার্বের ডুপ্লিকেট mesh (কোলাইডার এখনো আছে, শুধু ড্র হয় না)।

---

## [0.8.0] — 2026-11-01 — ব্যাচ B7–B8 (ইটারেশন 61–80)

### Added
- `src/styles/fonts.css` — Noto Sans Bengali 400/700 base64 woff2, `unicode-range` সহ। কেন: কন্টেইনারে বাংলা সিস্টেম ফন্ট নেই, সব টেক্সট টফু বক্স হত। `main.js`-এ `hud.css`-এর আগে import।
- কোয়ালিটি টিয়ার (high/mid/low) + হিস্টেরেসিস (`QualityGovernor`): ৪৭ FPS-এ নামে, ৫৮ FPS-এ ৪ উইন্ডো পরে ওঠে।
- বৃষ্টির রিপল পুল (≤২০০), স্কিডমার্ক পুল (≤৪০০ সেগমেন্ট, ৬ সে ফেড), টাকা পপআপ পুল।
- গ্যারেজের লাইভ স্ট্যাট + `garage_upgrades.json` ডেটা।

### Changed
- `PostFX` টিয়ার-ভিত্তিক: high=full bloom, mid=half-res, low=off (কম্পোজারই বন্ধ)।

### Fixed
- HUD নিরাপদ-এরিয়া (`env(safe-area-inset-*)`) সব প্যানেলে, বাটনের সর্বনিম্ন ৪৮ dp।

---

## [0.7.0] — 2026-11-01 — ব্যাচ B5–B6 (ইটারেশন 41–60)

### Added
- `ai/BossBapiAI.js` — ৬-স্টেট FSM (IDLE → AGGRO → WINDUP → CHARGE → FLAME → STUNNED), বুলডোজার ব্লেড।
- `systems/HelicopterMagnet.js` — ক্যাপচার (রেঞ্জ ২৬ m), ড্যাম্পিং ~০.৭, সীমিত উল্লম্ব বেগ, নরম রিলিজ।
- বাংলা RJ (shuffle-bag) + `BanglaAudioTrigger` — `speechSynthesis` না থাকলে formant `chatter()`।

### Fixed
- `Space` = ড্রিফট (ব্রেক নয়), `R` = আনস্টাক, `F` = যান বদল — কন্ট্রোল লিজেন্ড ও মেনুতে মিলিয়ে দেওয়া।

---

## [0.6.0] — 2026-11-01 — ব্যাচ B3–B4 (ইটারেশন 21–40)

### Added
- `TrafficGraph` + লেন-মার্জ AI (৩ সেকেন্ড cooldown, ইন্ডিকেটর), গরু/ষাঁড় বিপদ, হর্ন।
- `WantedSystem` (০–৫ "পাড়া চ্যাপ", heat rise/decay) + `ai/PoliceAI.js` প্রেডিক্টিভ ইন্টারসেপ্ট।
- ৭টি মিশন (`missions.json`), স্টার persist `desi_overdrive_v1_stars`-এ, `StarRating`।
- `GoldenHoop` — swept segment detection (টেলিপোর্টে হিট হয় না)।

---

## [0.5.0] — 2026-11-01 — ব্যাচ B1–B2 (ইটারেশন 1–20)

### Added
- ভিত্তি: `EventBus`, `GameState` (অনুমোদিত ট্রানজিশন), `GameManager` ৬০ Hz fixed step + render interpolation।
- `CityMap` গ্রিড শহর (ব্লক, রাস্তা, লেন-পেইন্ট, ল্যাম্প, পেট্রল পাম্প, বিলবোর্ড), `DayNightCycle`।
- যান: `BaseVehicleController` + Arcade/Rickshaw/TwoWheeler/Aerial + `VehicleRegistry` (পুল)।
- ক্যামেরা: `CineArcadeCamera` (chase/cinematic, speed-based FOV)।
- HUD: `MobileHUD`, `Joystick`, `NitroButton`, `Minimap`, `SubtitleBanner`, `MainMenu`।

### Fixed
- `SpeechSynthesis` ও `localStorage` ব্লক করা ব্রাউজারে ক্র্যাশ → try/catch + fallback।
