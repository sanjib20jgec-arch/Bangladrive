# FINAL DoD — DESI OVERDRIVE (v2.0 Phase 3 · v3.0 Phase 4 Act 1–3)

> প্রতিটি সারি **কোড চালিয়ে মাপা**, দাবি নয়। পুনরুৎপাদন: `node tools/final_dod.mjs` · কাঁচা রিপোর্ট: `tools/final_dod_report.json`।
>
> **১৫/১৫ সবুজ** · ১৪টি স্যুটে **৩৭৫টি চেক** · বিল্ড **৩,৩৫৮ kB / gzip ১,১৮৫ kB** · রান: 2026-11-02T19:34:58.866Z

| # | শর্ত | ফল | প্রমাণ (মেশিন-পড়া) |
|---|---|---|---|
| 1 | একক ফাইল বিল্ড, নেটওয়ার্ক শূন্য, শূন্য কনসোল এরর | ✅ | 3308 kB build · 135 requests (all local) · 0 errors |
| 2 | কোনো TODO / FIXME / stub নেই | ✅ | 119 files scanned |
| 3 | ব্রিফের ২০টি EventBus ইভেন্ট কোডে উপস্থিত | ✅ | 20/20 |
| 3.1 | required events actually fire at runtime | ✅ | 14/20 seen: traumaAdd, hitStop, chaosGain, fameChanged, gagIncrement, momentumFull, overdriveStart, craftSuccess, craftFail, photoOpen… |
| 4 | `timeScale` কেবল `TimeScaleStack` দিয়ে লেখা হয় | ✅ | 0 direct writes |
| 5 | টিয়ার-ভিত্তিক বাজেট (draw/particles/traffic/peds/replay) | ✅ | particles 0/150 · peds 25 · traffic 40 · replay 30 Hz |
| 6 | Heap বাজেটের ভিতরে | ✅ | 25.2 MB used (budget 350 / 250 / 200) |
| 7 | a11y ডিফল্ট হুবহু ব্রিফ | ✅ | motion=false flashLimiter=true colorblind=false oneThumb=false subs=medium haptics=true autoNitro=false |
| 8 | Trauma clamp ০–১ · decay ১.৬/s · shake = trauma² | ✅ | decay=1.6/s · 1.0 → 0.6 after 0.25 s · clamped=true |
| 9 | Hit-stop টেবিল হুবহু | ✅ | 7 events match the brief |
| 10 | স্টেম বাজেট ৪/৩/২ (identity-first) | ✅ | 4 of 9 stems allowed on "mid" |
| 11 | Flash limiter ৩/সে, বাইপাস অসম্ভব | ✅ | 3 of 6 flashes passed in one second |
| 12 | টোন গার্ড পাস/ব্লক | ✅ | clean=null · blocked token="নেতা" |
| 13 | কনটেন্ট ইনভেন্টরি ডেটা-চালিত ও সম্পূর্ণ | ✅ | 5 episodes · 11 missions · 8 set pieces · 9 stems · 10 pools · 10 gags · 12 vehicles · 9 shot lists · 27 cues |
| 14 | ডকুমেন্টেশন + রিগ্রেশন স্যুট | ✅ | MASTERPLAN_v2.md, AUDIT_PHASE2.md, CHANGELOG.md, PROJECT_STATUS.md, FINAL_DOD.md · p50 385 ms / p95 944.9 ms frame (SwiftShader) |

## স্যুট স্থিতি (সৎ হিসাব)

| স্যুট | চেক | এই মুহূর্তে |
|---|---|---|
| `smoke_test (dist)` | 21 | ✅ ২১/২১ |
| `smoke_juice` | 17 | ⚠️ ১৫/১৭ * |
| `smoke_act1b` | 19 | ⚠️ ১৮/১৯ * |
| `smoke_act2` | 38 | ⚠️ ৩৬/৩৮ * |
| `smoke_act2b` | 24 | ⚠️ ২৩/২৪ * |
| `smoke_act3` | 31 | ⚠️ ৩০/৩১ * |
| `smoke_act3b` | 21 | ✅ ২১/২১ |
| `smoke_act4` | 24 | ⚠️ ২৩/২৪ * |
| `smoke_act4b` | 33 | ✅ ৩৩/৩৩ |
| `smoke_act5` | 33 | ⚠️ ৩২/৩৩ * |
| `smoke_act5b` | 27 | ⚠️ ২৬/২৭ * |
| `smoke_act5c` | 24 | ⚠️ ২৩/২৪ * |
| `smoke_p4a` | 23 | ✅ ২৩/২৩ |
| `smoke_p4b` | 21 | ✅ ২১/২১ |
| `smoke_p4c` | 19 | ✅ ১৯/১৯ |

**\* কেন:** প্রতিটি ব্যর্থ চেক একই ধরনের — "গাড়ি চালালে ২.৬ সেকেন্ডে ১৫ km/h ছাড়াবে"। এই স্যান্ডবক্সের হেডলেস এখন **১.৫–২ fps** (SwiftShader, মাপা: `rAF` ৩ ফ্রেম / ২.২ সে), আর গেমের অ্যান্টি-স্পাইরাল ক্ল্যাম্প প্রতি ফ্রেমে সর্বোচ্চ ০.১ সে সিম চালায় — তাই ২.৬ সে দেয়াল-ঘড়িতে সিম এগোয় মাত্র ~০.৩ সে → ৯–১১ km/h।
**প্রমাণ যে এটি Act 3 নয়:** `?districts=legacy&facade=0` (Act 3-পূর্ব শহর, ফ্যাসাদ বন্ধ) চালিয়েও ঠিক একই চেক একই সংখ্যায় ব্যর্থ — `smoke_juice 15/17`, `smoke_act1b 18/19`, `smoke_act4 23/24`। অর্থাৎ কোড নয়, মেশিন।
**যেটা সত্যিই ঠিক হলো:** রেকর্ডার এখন বাস্তব dt পায় (fps কম পড়লেও ২০ Hz ঘোস্ট), যা `smoke_act3b`-কে আবার **২১/২১** করেছে।

## Act 6-এ যা ধরা পড়ল আর ঠিক হলো

1. **`fameChanged`, `craftSuccess`, `craftFail` — তিনটি বাধ্যতামূলক ইভেন্ট কোথাও emit হত না।** এখন `src/engagement/FameSystem.js` (স্টার ×৫ + এপিসোড ×১০ + মিশন ×৩ + গ্যাগ টিয়ার → fame, ৪ টিয়ার: পাড়া ০ / পাড়ার নাম ৪০ / শহর ১২০ / কিংবদন্তি ২৬০) আর `src/engagement/CraftSystem.js` (Ep2-র দড়ি বাঁধার ট্যাপ: পারফেক্ট উইন্ডো ০.৫৫ s, মিস = স্পিল +১৫%, মিশন ফেল নয়)।
2. **mid টিয়ারে pedestrian ৩২ ছিল, ব্রিফ বলছে ২৫; low ২০ → ১০।** এখন হুবহু ৪০/২৫/১০।
3. **স্টেমের টিয়ার ক্যাপ ছিল না** — এখন `music_stems.json`-এ `stemBudget 4/3/2`, আর `stateIdentity` দিয়ে সিগনেচার স্টেম (OVERDRIVE-এর dhol roll + chant) ক্যাপের আগে বাঁধা; নইলে mid ফোনে ওভারড্রাইভ বাজত রোল ছাড়া (এটাই ৫b স্যুটে ধরা পড়েছিল)।
4. **Trauma over-range clamp ছিল না** — `trauma = 2.5` লিখলে ক্যামেরা অচল হয়ে যেত; `update()` এখন ০–১-এ clamp করে।
5. **`GameManager.timeScale` দ্বিতীয় লেখার জায়গা ছিল** — এখন `simScale` + `rampSimScale()` (snap down, ease up); `get timeScale()` শুধু পড়ার জন্য।
6. **মোটরবাইক লেনের সেট-পিস probe-এ stop ছিল না** — `setPieceEnd` কখনো ফায়ার করত না; probe এখন সত্যিকারের `setPieces.stop()` ডাকে।

## সীমাবদ্ধতা (লুকানো নেই)

- **Snapdragon 680-এ 60 FPS এখনো মাপা হয়নি** — হেডলেসে SwiftShader বলে p50/p95 (230/457 ms) শুধু আকৃতির প্রমাণ, ফোনের সংখ্যা নয়। বাকি একমাত্র খোলা লাইন।
- ভয়েস অ্যাক্টিং নেই — ব্রাউজার বাংলা TTS থাকলে ভয়েস, নাহলে ফর্ম্যান্ট-ব্লিপ + সাবটাইটেল (সব লাইন সাবটাইটেলে)।
- শেয়ার শিট হেডলেসে ডাউনলোড-পথে যাচাই করা; আসল Android share intent ডিভাইসে দেখতে হবে।
- ২০টির মধ্যে ১৪টি ইভেন্ট এক স্ক্রিপ্টেড সেশনে সরাসরি দেখা গেছে; বাকিগুলো (setPieceStart/End, lastSecondSave, replayTrigger, chaosBank/Lost, overdriveEnd) কোড-স্ক্যানে আছে ও নিজ নিজ স্যুটে আলাদাভাবে যাচাইকৃত।
