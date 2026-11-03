# P4 / Act 4 প্রস্তুতি — Capacitor র‍্যাপার (এখনো বিল্ড হয়নি)

> এই ফাইলটা **পরিকল্পনা**, দাবি নয়। এই স্যান্ডবক্সে Android SDK নেই, তাই APK এখানে বিল্ড করা যায়নি — এবং বিল্ড না করে "APK তৈরি" বলা মিথ্যে হবে। নিচের ধাপগুলো হুবহু চালালেই বিল্ড হবে।

## কেন Capacitor (Cordova/WebView নয়)
আমাদের ডেলিভারেবল ইতিমধ্যেই **একটাই `dist/index.html`** — কোনো নেটওয়ার্ক কল নেই, কোনো এক্সটার্নাল ফন্ট/টেক্সচার নেই। তাই র‍্যাপারের কাজ শুধু: ওয়েবভিউ + ব্যাক-বাটন + সেফ-এরিয়া + অডিও আনলক।

## ধাপ
```bash
npm i -D @capacitor/cli && npm i @capacitor/core @capacitor/android
npx cap init "Desi Overdrive" com.desioverdrive.game --web-dir=dist
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug      # → app/build/outputs/apk/debug/app-debug.apk
```
`capacitor.config.json` (তৈরি হবে, এডিট করো):
```json
{ "appId": "com.desioverdrive.game", "appName": "Desi Overdrive",
  "webDir": "dist", "android": { "allowMixedContent": false, "webContentsDebuggingEnabled": false },
  "plugins": { "SplashScreen": { "launchAutoHide": true, "backgroundColor": "#0b0f1e" } } }
```

## যা এখনই ঠিক আছে (কোডে)
- `dist/index.html` self-contained → `webDir: dist` হুবহু কাজ করবে।
- সব ইনপুট `InputManager` দিয়ে → টাচ + গেমপ্যাড + কীবোর্ড একই পথে (Act 1-এ প্রমাণিত)।
- `AudioContext` শুধু প্রথম ইউজার-জেস্টারে `resume()` হয় (PWA/Browser উভয়ের জন্য আগেই করা)।
- a11y: `reducedMotion`, flash limiter, সাবটাইটেল সাইজ — ফোনের সেটিংস থেকে স্বাধীন।

## যা Act 4-এ করতে হবে (চেকলিস্ট)
1. `BackButton` → `DESI_API` `pause` (গেম চলাকালে পজ, মেনুতে বের হওয়া)।
2. সেফ-এরিয়া: `env(safe-area-inset-*)` HUD প্যাডিং — নচ/জেসচার বার।
3. লঞ্চ স্ক্রিন + `#0b0f1e` ব্যাকগ্রাউন্ড (সাদা ফ্ল্যাশ বন্ধ)।
4. APK সাইজ: ৩.৩ MB বেস৬৪ → ফ্যাসাদ অ্যাটলাস এলে asset splitting (Act 3)।
5. `APK_FIRST_RUN.md`: Snapdragon 680-এ FPS/জেটার/হিট-স্টপ মাপা — **এটাই একমাত্র খোলা DoD লাইন**।
