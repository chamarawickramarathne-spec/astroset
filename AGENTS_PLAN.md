# AGENTS_PLAN.md

## Current Track
Google Play submission. The app is a single flat Expo project (Mod 036).
Sequence: update plan → commit Mod 036 → rebuild signed AAB/APK → consolidate to release/ →
host Privacy Policy on GitHub Pages → publish matching OTA update → hand off Play Console runbook.

## In Progress (Mod 037)
- [ ] Update AGENTS_PLAN.md + AGENTS.md (Mod 037 docs)
- [ ] Commit Mod 036 flat-project restructuring
- [ ] Rebuild signed AAB/APK from flattened source (gradlew bundleRelease + assembleRelease)
- [ ] Verify AAB: package com.vortex.astro, versionCode 8 / "1.3.1", no ads libs, targetSdk 36
- [ ] Consolidate new AAB/APK/mapping.txt into root release/
- [ ] Create private GitHub repo + push + publish Privacy Policy via GitHub Pages
- [ ] Confirm privacy policy URL live
- [ ] Publish OTA update (eas update --channel default) after rebuild
- [ ] Commit Mod 037 work
- [ ] Hand off Play Console runbook (user: create app, store listing, data safety, content rating, upload AAB)

## In Progress
- [x] Use Expo token from credentials.txt for EAS auth (kogn12 / chamara.wickramarathne@gmail.com)
- [x] Install eas-cli (global, under E:\AIprojects\AI Agent per rule 1.1)
- [x] Create/link EAS project @kogn12/astroset (projectId 4db59433-266e-4e90-866d-6484bf9d6969)
- [x] Install expo-updates (~57.0.22) in apps/mobile
- [x] app.json: updates block (url https://u.expo.dev/4db59433-...), runtimeVersion fingerprint policy, extra.eas.projectId, owner kogn12; version 1.3 -> 1.3.1, versionCode 7 -> 8
- [x] Create apps/mobile/eas.json (development/preview/production profiles; channels default/preview)
- [x] expo prebuild + re-apply wipe list (release signing config, R8 minify+shrink, gradle wrapper 8.14.3)
- [x] Rebuild signed AAB/APK and consolidate to root release/ (AstroSet-android.apk 93.2MB, .aab 68.5MB, -mapping.txt 54.7MB)
- [x] Publish initial OTA update to default channel (Android group 73ac4383-708e-4c65-9dec-9e5aa07e6c62, runtime 61bdafc2..., commit b3a3502)
- [x] Initialize Git repo + .gitignore hardening (credentials.txt, keystores, build caches excluded); initial commit b3a3502
- [x] Update docs (AGENTS.md Mod 035, AGENTS_PLAN.md, medial_support.txt)

## Build Fixes (this session)
- [x] The `update` top-level block is NOT accepted in eas.json by eas-cli 24.x — removed; channels are defined per build profile instead
- [x] `updates.checkAutomatically` in app.json must be a JS-facing enum value: `ON_LOAD` | `WIFI_ONLY` | `NEVER` | `ON_ERROR_RECOVERY`. Native values (`ALWAYS`) and removed values (`ON_LOAD_AND_SPLASH`) are rejected by the EAS manifest validator. `ON_LOAD` maps to native `ALWAYS` in AndroidManifest (`EXPO_UPDATES_CHECK_ON_LAUNCH`)
- [x] Changing app.json after a build changes the runtime fingerprint → a full `expo prebuild` + rebuild is required for embedded runtimeVersion to match published updates

## In Progress
- [x] Phase 0: Sync AGENTS_PLAN.md + AGENTS.md to reflect current 1.3.0 state
- [x] Phase 1: Privacy & Data Safety — in-app Privacy Policy screen (apps/mobile/app/privacy.tsx) + Settings link
- [x] Phase 2: Ads REMOVED entirely — deleted ads.ts + AdBanner.tsx, stripped imports/usages in all 4 screens + _layout, removed react-native-google-mobile-ads dep (pnpm install dropped 21 packages), cleared app.json plugin + AndroidManifest meta-data via expo prebuild; privacy policy rewritten ad-free (privacy.tsx + release/PRIVACY_POLICY.md)
- [x] Phase 3: Version — root package.json 1.2.0 -> 1.3; versionName 1.3.0 -> 1.3 in app.json + build.gradle
- [x] Phase 4: Android versionCode 6 -> 7 (app.json + build.gradle); versionName "1.3"
- [x] Phase 5: Rebuild signed AAB/APK with NEW keystore; consolidate to release/
- [x] Phase 6: Update docs (AGENTS.md Mod 034, AGENTS_PLAN.md, medial_support.txt ad-free)

## Build Fixes (this session)
- [x] Desktop app fully removed (apps/desktop/ and root desktop installers deleted); root package.json scripts cleaned (dev/start/android/typecheck); AGENTS.md rewritten mobile-only
- [x] Gradle wrapper 9.3.1 -> 8.14.3 (9.3.1 broke at included-build settings plugins{} compile); backup gradle-wrapper.properties.bak
- [x] react-native-google-mobile-ads 16.5.0 -> 15.8.3 (play-services-ads 24.6.0) to resolve Kotlin metadata 2.3.0 vs Kotlin 2.1.20 incompatibility
- [x] NEW: expo-modules-core 57.0.14 worklet C++ calls runtime->executeSync() which no longer exists in react-native-worklets 0.12.1 (renamed runSync). Fixed via durable pnpm patch (patches/expo-modules-core@57.0.14.patch) disabling expo worklets integration (build.gradle enableWorkletsIntegration=false). App uses reanimated's worklets, not expo's, so this is safe. worklets cannot be downgraded (reanimated 4.6.0 hard-requires 0.12.x) and expo-modules-core 57.0.14 is latest.
- [x] Rebuild :app:assembleRelease :app:bundleRelease with patched deps; copy outputs to root release/ (AstroSet-android.apk/.aab/-mapping.txt)

## Completed
- [x] Initialize monorepo with pnpm + Turborepo
- [x] Create shared packages/core with types and API clients
- [x] Implement Vedic astrology API (VedAstro)
- [x] Implement Western astrology APIs (CosmyDay, Aztro)
- [x] Implement solar/space weather APIs (NOAA SWPC, NASA DONKI)
- [x] Implement weather API (Open-Meteo)
- [x] Create Electron desktop app structure
- [x] Build desktop UI with tabs (Today, Solar, Weather, Settings)
- [x] Create React Native Expo mobile app structure
- [x] Build mobile UI with tabs (Today, Solar, Weather, Settings)
- [x] Implement notification system for mobile
- [x] Install dependencies (verified with pnpm install --frozen-lockfile)
- [x] Test desktop app (build + launch verified, no errors, window stable)
- [x] Test mobile app (typecheck + Metro export 916 modules OK)
- [x] Build Windows installers x86 + x64 (NSIS, AstroSet-Setup-x86.exe / AstroSet-Setup-x64.exe)
- [x] Build Android APK (app-release.apk 78.5 MB, debug-signed)
- [x] Add offline caching (core cache layer + localStorage/AsyncStorage adapters)
- [x] Create app icons and splash screens (SVG brand set + all PNG assets wired into desktop/mobile)
- [x] Final testing and polish (rebuilds with branding verified: icon embedded in exe, installed x64 + unpacked x86 both launch, APK rebuilt via prebuild + gradle)
- [x] Regenerate medial_support.txt with current feature set
- [x] Planetary Alignment Chart (zodiac wheel, desktop + mobile, astronomy-engine on-device computation)
- [x] Upcoming Moon Events (phases + perigee/apogee, next 30 days)
- [x] Upcoming Planetary Events (retrograde stations + sign ingresses, next 30 days)
- [x] Fix Recent Solar Flares (NOAA GOES-18 X-ray detection replaces rate-limited NASA DONKI; DONKI kept as fallback)
- [x] 7-day X-ray Flux area chart on desktop Solar page
- [x] 7-day X-ray Flux area chart on mobile Solar screen (react-native-svg port, parity with desktop)
- [x] Remove Yoga field from Vedic Panchang
- [x] Rebuild all distributables and consolidate into root release/
- [x] Desktop Today tile redesign (Tile Design System v2: category accents, icon chips, stat tiles, timelines, hover states)
- [x] Schumann Resonance chart on Solar page (desktop + mobile): ResonanceOne activity index + Tomsk live spectrogram
- [x] Fix desktop Schumann spectrogram (CORS header injection for sos70.ru + img-src CSP directive)
- [x] Fix Daily Horoscope empty state (CosmyDay API field rename description -> content)
- [x] Solar page restructure on both platforms: merged Space Weather Summary card, storms count tile removed, full-width X-Ray + Schumann charts
- [x] Tile reordering pass: Today page (Moon+Panchang merged, Kp tile removed, Weather to 2nd), Solar page order per spec, Theme removed from Settings
- [x] Settings persistence (Mod 020): loadSettings/saveSettings in core store, both apps gate on load, corrupt-JSON errors surfaced
- [x] AdMob banner ads on Android (Mod 021): react-native-google-mobile-ads 14.11.0, UMP consent, adaptive banner on all 4 tabs, test IDs in dev builds
- [x] Fixed New Architecture build failure caused by folder rename (ninja 1.10.2 -> 1.12.1 swap in Android SDK)
- [x] Version bump to 1.1.0 (versionCode 2) + rebuild all release artifacts
- [x] Data accuracy audit (Mod 025): fix RTSW newest-first solar wind, real Bz from mag feed, exact moon illumination/age, Kundlit timezone from Open-Meteo, as-of timestamps + horoscope date labels
- [x] Play resubmission remediation (Mod 033): in-app Privacy Policy screen + Settings link; FORCE_TEST_ADS=false; dedicated AstroSet AdMob placeholders; version aligned to 1.3.0; versionCode 5->6; rebuilt signed AAB/APK/mapping consolidated to release/; desktop app fully removed; gradle wrapper 8.14.3; google-mobile-ads 15.8.3; expo-modules-core worklet pnpm patch
- [x] AdMob removed (Mod 034): deleted ads.ts + AdBanner.tsx, stripped all screen usages, removed dep + plugin + manifest meta-data; versionName 1.3.0 -> 1.3 and versionCode 6 -> 7 (fixed trailing .0 rejection); NEW keystore generated (old lost to prebuild); re-applied signing + R8 + wrapper 8.14.3; rebuilt signed AAB/APK, verified no ads code in bundle; privacy policy rewritten ad-free; consolidated to release/
- [x] EAS Update (OTA) integration (Mod 035): expo-updates installed, EAS project linked, app.json updates/fingerprint config, eas.json created, native regenerated + wipe list re-applied, version 1.3.1 / versionCode 8, initial OTA published to default channel, Git repo initialized + first commit
- [x] Monorepo flattened to a single Expo project (Mod 036): apps/mobile + packages/core moved to repo root, `@astroset/core` imports rewritten to relative `../src/core`, tsconfig paths removed, react-navigation dropped (useFocusEffect now from expo-router), pnpm-workspace.yaml/turbo.json/tsconfig.base.json deleted, root package.json is the app manifest, fresh install + typecheck + Metro export verified

## Pending / Blocking for Play resubmission
- [ ] Play Console: fill Data safety form, content rating, store listing (user, manual)
- [ ] Deferred: re-add monetization (AdMob) later with dedicated AstroSet App ID/unit

## Known Issues / Follow-ups (optional, non-blocking)
- `expo-modules-core` worklet patch lives in `pnpm-lock.yaml` (path `patches/expo-modules-core@57.0.14.patch`). If the lockfile is ever regenerated from scratch, the patch MUST be re-registered via a `pnpm-workspace.yaml` `patchedDependencies` block, or the Android build will fail on `runtime->executeSync()`.

## Notes
- All APIs are free tier
- NOAA SWPC provides unlimited solar data with no authentication
- Open-Meteo provides 10,000 API calls/day for weather
- VedAstro provides 5 requests/minute for Vedic astrology
- CosmyDay and Aztro are completely free with no API keys required
