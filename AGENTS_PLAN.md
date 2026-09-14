# AGENTS_PLAN.md

## Current Track
Play Store submission is ready. All Mod 037 work (rebuild, OTA, GitHub, docs) is complete.
Play Console runbook was handed off to user — awaiting user to create app, fill listing, and upload AAB.

## Mod 037 — Completed
- [x] Update AGENTS_PLAN.md + AGENTS.md (Mod 037 docs)
- [x] Commit Mod 036 flat-project restructuring
- [x] Rebuild signed AAB/APK from flattened source (gradlew bundleRelease + assembleRelease)
- [x] Verify AAB: package com.vortex.astro, versionCode 8 / "1.3.1", no ads libs, targetSdk 36
- [x] Consolidate new AAB/APK/mapping.txt into root release/
- [x] Create GitHub repo `chamarawickramarathne-spec/astroset` (public, free plan) + push
- [x] Publish Privacy Policy via GitHub Pages from `gh-pages` branch — live at `https://chamarawickramarathne-spec.github.io/astroset/privacy.html`
- [x] Publish OTA update (eas update --channel default, Android group 62e3d8d6, runtime bdd056be)
- [x] Commit Mod 037 work (2 commits on main)
- [x] Hand off Play Console runbook (store listing, data safety, content rating, upload AAB + mapping.txt)

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
- [x] Play Store prep (Mod 037): rebuilt signed AAB/APK/mapping.txt from flattened source; committed full changeset; created public GitHub repo `chamarawickramarathne-spec/astroset`; published Privacy Policy via GitHub Pages at `https://chamarawickramarathne-spec.github.io/astroset/privacy.html`; published OTA update (group 62e3d8d6, runtime bdd056be, default channel); all files verified (package, versionCode 8, targetSdk 36, no ads, correct keystore)

## Pending / Blocking for Play resubmission
- [ ] User action (manual, runbook provided): Play Console — create app, fill store listing, Data safety form (no data collected), content rating (IARC), upload `release/AstroSet-android.aab` + `-mapping.txt`, internal test then production
- [ ] Deferred: re-add monetization (AdMob) later with dedicated AstroSet App ID/unit

## Known Issues / Follow-ups (optional, non-blocking)
- `expo-modules-core` worklet patch lives in `pnpm-lock.yaml` (path `patches/expo-modules-core@57.0.14.patch`). If the lockfile is ever regenerated from scratch, the patch MUST be re-registered via a `pnpm-workspace.yaml` `patchedDependencies` block, or the Android build will fail on `runtime->executeSync()`.

## Notes
- All APIs are free tier
- NOAA SWPC provides unlimited solar data with no authentication
- Open-Meteo provides 10,000 API calls/day for weather
- VedAstro provides 5 requests/minute for Vedic astrology
- CosmyDay and Aztro are completely free with no API keys required
