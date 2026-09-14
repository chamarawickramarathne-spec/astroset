# AstroSet

## Overview
AstroSet is an Android-only daily events application that provides:
- **Astrology events** (Vedic + Western)
- **Solar events** (sun activity, solar flares)
- **Space weather** (geomagnetic storms, aurora)
- **Weather forecasts** (daily conditions, UV index)

Published on Google Play (package `com.vortex.astro`). The desktop (Electron) app has been removed; this project is mobile/Android only.

## Tech Stack
- **Mobile (Android):** React Native + Expo (single flat project, no monorepo)
- **Shared Logic:** `src/core/` (was `packages/core`, moved in-place)
- **Notifications:** expo-notifications (local scheduled)
- **OTA Updates:** EAS Update (expo-updates)

## Project Structure
```
astroset/
├── app/                  # expo-router screens (Today, Solar, Weather, Settings, Privacy)
├── src/
│   ├── core/             # Shared business logic (was packages/core)
│   └── hooks/            # useNotifications
├── components/           # PlanetaryChart, XrayChart, etc.
├── android/              # Native Android project (built via expo prebuild)
├── assets/               # App icons, splash, adaptive icon
├── release/              # Play Store distributable artifacts
│   ├── AstroSet-android.apk
│   ├── AstroSet-android.aab
│   ├── AstroSet-android-mapping.txt
│   ├── feature_graphic.png
│   ├── PRIVACY_POLICY.md
│   ├── phone/            # Play Store phone screenshots
│   ├── tablet7/          # Play Store 7-inch tablet screenshots
│   └── tablet10/         # Play Store 10-inch tablet screenshots
├── media/                # Icons, logos, screenshots
├── patches/              # pnpm patches (expo-modules-core worklet fix)
├── AGENTS.md
├── AGENTS_PLAN.md
└── medial_support.txt
```

## API Sources (All Free)

### Astrology
- **VedAstro API** - Vedic + Western astrology (5 req/min, unlimited)
- **CosmyDay API** - Western horoscopes, sky events (free, no key)
- **Aztro API** - Daily horoscope (free, no key)

### Solar/Space Weather
- **NOAA SWPC** - Solar flares, geomagnetic storms, aurora (unlimited, no auth)
- **NASA DONKI** - Solar flares, CMEs, storms (1,000/day with DEMO_KEY)

### Weather
- **Open-Meteo** - Global weather, UV index (10,000/day, no auth)

## Development Commands

### Install Dependencies
```bash
pnpm install
```

### Run Mobile App
```bash
pnpm dev        # or: pnpm start
```

### Typecheck Mobile
```bash
pnpm typecheck
```

### Build Signed AAB / APK (Android)
```bash
# from android/
.\gradlew.bat :app:assembleRelease :app:bundleRelease
```

### Publish OTA Update (EAS Update)
```bash
# requires EXPO_TOKEN (see credentials.txt)
eas update --channel default --environment production --message "<what changed>" --non-interactive
```
- Only JS + assets are updated over-the-air; the installed app must be a build that embeds the same `runtimeVersion` fingerprint.
- After changing `app.json` (version, `checkAutomatically`, etc.) you MUST re-run `expo prebuild` + re-apply the wipe list and rebuild, or the fingerprint will not match.

### After `expo prebuild` (MANDATORY re-apply list — prebuild wipes these)
1. Restore `android/keystore.properties` + `android/app/release.keystore`
2. `android/app/build.gradle`: release `signingConfig` block + `minifyEnabled true` + `shrinkResources true` (R8)
3. `android/gradle/wrapper/gradle-wrapper.properties`: pin `gradle-8.14.3-bin.zip` (prebuild resets to 9.3.1)

## Release Artifacts Rule (MANDATORY)

After every Android build, all Play Store distributable artifacts MUST be placed in the root-level `release/` folder with these exact names:

```
release/
├── AstroSet-android.apk   # Android APK (from android/app/build/outputs/apk/release/)
├── AstroSet-android.aab   # Android App Bundle (from android/app/build/outputs/bundle/release/)
└── AstroSet-android-mapping.txt  # R8 deobfuscation mapping (from android/app/build/outputs/mapping/release/)
```

- Build outputs land in `android/app/build/outputs/...`; they must be copied to root `release/` after each build.
- Never use version numbers in artifact filenames; keep stable names.
- The `.aab` is the artifact uploaded to the Google Play Console.

## Modifications

### Modification 001
**Date:** 2026-08-20

**Changes:**
- Initial project setup
- Created monorepo structure with Turborepo
- Implemented shared core package with API clients
- Created Electron desktop app with React UI
- Created React Native Expo mobile app
- Added Vedic and Western astrology support
- Added solar/space weather monitoring
- Added weather forecasts with UV index
- Implemented notification system

**Files/Components:**
- `packages/core/` - Shared business logic
- `apps/desktop/` - Electron Windows app
- `apps/mobile/` - React Native Android app

**Important Notes:**
- All APIs are free tier with no authentication required (except NASA DEMO_KEY)
- Desktop app uses Electron with React renderer
- Mobile app uses Expo with file-based routing
- Shared code in `packages/core` for API clients and types

### Modification 002
**Date:** 2026-08-20

**Changes:**
- Fixed `TypeError: Cannot read properties of null (reading 'useState')` crash on startup
- Root cause: pnpm hoisting placed react@19.2.8 in `apps/desktop/node_modules/` but react-dom@19.2.8 in root `node_modules/` with react@18.3.1 — esbuild bundled two different React instances
- Replaced esbuild `alias` config with an esbuild plugin (`reactSingletonPlugin`) that intercepts ALL react/react-dom resolution globally, including transitive imports within bundled packages
- Installed react-dom@19.2.8 as devDependency in desktop app

**Files/Components:**
- `apps/desktop/esbuild.config.js` - Replaced `alias` with `reactSingletonPlugin`
- `apps/desktop/package.json` - Added react-dom@19.2.8 devDependency

**Important Notes:**
- esbuild's `alias` feature does NOT apply to transitive imports within bundled packages — this caused react-dom to resolve its internal `react` import to root's react@18.3.1 instead of the aliased react@19.2.8
- The `reactSingletonPlugin` uses `onResolve` hooks which fire for ALL import resolutions in the bundle, guaranteeing a single React instance
- Desktop always uses `apps/desktop/node_modules/react` (19.2.8) and root `node_modules/react-dom` (19.2.8)

### Modification 003
**Date:** 2026-08-20

**Changes:**
- Fixed 3 dead API endpoints causing 404 errors
- NOAA SWPC: Replaced deprecated `plasma-7-day.json` (removed Apr 2026) with `rtsw_wind_1m.json` for solar wind data; flares now use NASA DONKI
- VedAstro: Replaced dead `api.vedastro.org` with Kundlit API (`kundlit.com/api/astro/panchanga`) — free, no key, 60 req/min
- Aztro: Removed dead `aztro.sameerkumar.website` — CosmyDay already provides horoscopes
- Updated NOAA Kp index parsing for new field names (`Kp` vs `kp_index`)

**Files/Components:**
- `packages/core/src/api/noaa.ts` - New RTSW solar wind endpoint, NASA DONKI flares, updated Kp parsing
- `packages/core/src/api/vedastro.ts` - Replaced with Kundlit API (POST, JSON body)
- `packages/core/src/api/index.ts` - Removed aztro imports and fallback logic

**Important Notes:**
- NOAA deprecated all `/products/solar-wind/` endpoints April 30, 2026; replacement is `/json/rtsw/rtsw_wind_1m.json`
- Kundlit API fields: `tithi.name`, `tithi.paksha`, `nakshatra.name`, `yoga.name`, `karana.name`, `vaara.name`, `sun_rise`, `sun_set`, `moon_rise`, `moon_set`, `rahu_kaal`
- Kundlit requires `timezone` parameter (IANA format, e.g. `Asia/Kolkata`)
- CosmyDay horoscope endpoint (`/content/daily/{sign}`) returns full horoscope data including sky positions

### Modification 004
**Date:** 2026-08-21

**Changes:**
- Fixed mobile app entry point: main field pointed to 
ode_modules/expo/AppEntry.js which no longer exists in Expo SDK 52
- Changed main to expo-router/entry since the app uses expo-router file-based routing (pp/_layout.tsx)
- Verified mobile app: TypeScript typecheck passes, Metro export bundles 916 modules into Android Hermes bundle successfully

**Files/Components:**
- pps/mobile/package.json - main field fix

**Important Notes:**
- Expo SDK 52 removed AppEntry.js; apps using expo-router must use "expo-router/entry" as main

### Modification 005
**Date:** 2026-08-21

**Changes:**
- Added offline caching layer in shared core (packages/core/src/cache.ts)
- cachedFetch(key, fetcher): network-first; on success persists result via storage adapter; on network failure serves cached data and reports romCache: true
- configureStorage(adapter): pluggable storage; desktop uses localStorage, mobile uses AsyncStorage; memory fallback default
- Wired into desktop App.tsx and mobile Today/Solar/Weather screens; UI shows "(cached)" suffix on last-update time when serving stale data
- Cache keys include location/zodiac params so settings changes never serve wrong-location data
- Added @react-native-async-storage/async-storage@1.24.0 to mobile app

**Files/Components:**
- packages/core/src/cache.ts (new), packages/core/src/index.ts
- pps/desktop/src/renderer/App.tsx
- pps/mobile/app/_layout.tsx, pps/mobile/app/index.tsx, pps/mobile/app/solar.tsx, pps/mobile/app/weather.tsx
- pps/mobile/package.json

**Important Notes:**
- Cache is only used when the network request fails; fresh data always overwrites cache
- AsyncStorage pinned to 1.24.0 because 2.x requires Kotlin Gradle Plugin 2.x APIs not available in RN 0.76

### Modification 006
**Date:** 2026-08-21

**Changes:**
- Fixed Android release build failures and produced first successful APK
- Created pps/mobile/index.js re-exporting expo-router/entry (Metro gradle bundling requires a physical entry file)
- Pinned config.projectRoot = projectRoot in pps/mobile/metro.config.js
- Created root-level index.js re-exporting expo-router/entry: on Windows the RN Gradle plugin passes --entry-file as a path RELATIVE to the app dir, but Expo CLI resolves it against the Metro server root (monorepo root when pnpm workspace detected); root-level file satisfies both interpretations
- Aligned Kotlin version: ndroid/build.gradle kotlinVersion 1.9.25 -> 1.9.24 to match the Kotlin Gradle Plugin pinned by RN 0.76, so expo-modules-core selects Compose Compiler 1.5.14 (1.9.25/1.5.15 combo failed compilation)

**Files/Components:**
- index.js (new, repo root), pps/mobile/index.js (new), pps/mobile/metro.config.js, pps/mobile/android/build.gradle

**Important Notes:**
- Build output: pps/mobile/android/app/build/outputs/apk/release/app-release.apk (78.3 MB), signed with debug keystore (store release requires real signing config)
- Root cause chain documented for future rebuilds: Windows cliPath relativization + Expo getMetroServerRoot workspace detection

### Modification 007
**Date:** 2026-08-21

**Changes:**
- Created original AstroSet brand assets (SVG sources + rendered PNGs)
- Logo design: rising sun on horizon with orbit ring, crescent moon, star field on deep-space navy (#0f0f23 family) matching app UI theme
- Replaced corrupt desktop icon placeholder (file started with zero bytes, invalid PNG) and tiny mobile placeholders
- Generated: 1024px app icon (desktop build/icon.png + media/icons), transparent mark for splash/adaptive-icon, white silhouette notification icon (96px), favicon (48px)
- Wired electron-builder win.icon to build/icon.png; Expo app.json paths already referenced ./assets/* and now resolve to real files
- Verified expo config resolves all image paths; pixel-level check confirms all design elements present

**Files/Components:**
- media/logos/astroset-logo.svg, media/logos/astroset-mark.svg, media/logos/astroset-notification.svg (new)
- media/icons/icon-1024.png, media/icons/icon-mark-1024.png (new)
- pps/desktop/build/icon.png, pps/desktop/package.json
- pps/mobile/assets/{icon,splash,adaptive-icon,notification-icon,favicon}.png

**Important Notes:**
- SVGs are the source of truth; regenerate PNGs from them if branding changes
- Desktop installers and Android APK must be rebuilt to embed the new icons (scheduled for final polish build)

### Modification 008
**Date:** 2026-08-21

**Changes:**
- Final polish build: rebuilt Windows installers (x86 + x64) and Android APK with new branding
- Verified custom icon embedded in packaged AstroSet.exe (icon resource hash differs from stock Electron)
- Resolved false alarm: earlier "installed app won't start" was a test-methodology error (checked for electron.exe process name; packaged app runs as AstroSet.exe). Installed x64 app and unpacked x86 build both verified running with visible AstroSet window
- Ran expo prebuild to bake new icons/splash into android res (mipmap webp launchers, splashscreen_logo, notification_icon at all densities); kotlinVersion 1.9.24 edit survived prebuild
- Rebuilt APK: 78.5 MB with icons embedded
- Regenerated medial_support.txt with current feature set

**Files/Components:**
- pps/desktop/release/AstroSet-Setup-x64.exe, AstroSet-Setup-x86.exe
- pps/mobile/android/app/build/outputs/apk/release/app-release.apk
- pps/mobile/android/app/src/main/res/* (regenerated via prebuild)
- medial_support.txt

**Important Notes:**
- electron-builder emits an extra combined AstroSet-Setup.exe when dual arch targets are configured; it is deleted after each build, keep only arch-specific installers
- Packaged Electron apps appear under their product name in process lists, not as electron.exe

### Modification 009
**Date:** 2026-08-21

**Changes:**
- Consolidated all distributable artifacts into a single root-level `release/` folder
- Moved AstroSet-Setup-x64.exe and AstroSet-Setup-x86.exe from apps/desktop/release/
- Moved Android APK and renamed it app-release.apk -> AstroSet-android.apk for consistent naming with the Windows installers
- Deleted outdated version-numbered installer "AstroSet Setup 1.0.0.exe" that was in release/ (superseded by current arch-specific installers)

**Files/Components:**
- release/AstroSet-Setup-x86.exe, AstroSet-Setup-x64.exe, AstroSet-android.apk (new consolidated location)
- apps/desktop/release/, apps/mobile/android/app/build/outputs/apk/release/ (sources, now emptied of distributables)

**Important Notes:**
- Future builds still output to apps/desktop/release/ and android build outputs; artifacts must be re-copied/moved to root release/ after each build
- Unpacked build folders (win-unpacked, win-ia32-unpacked) and .blockmap files remain in apps/desktop/release/ (not distributables)

### Modification 010
**Date:** 2026-08-21

**Changes:**
- Added Planetary Alignment Chart: interactive zodiac wheel (SVG) showing live geocentric positions of Sun through Pluto with sign, degree, and retrograde markers, plus a legend; rendered on desktop Today page and mobile Today screen
- Added Upcoming Moon Events: next 30 days of new/full/quarter moons plus lunar perigee/apogee with distances
- Added Upcoming Planetary Events: next 30 days of retrograde stations and sign ingresses for Mercury-Pluto
- Positions/events computed on-device via astronomy-engine@2.1.19 added to packages/core (no API dependency)
- Fixed missing Recent Solar Flares on desktop: NASA DONKI DEMO_KEY was returning HTTP 429 (shared-key rate limit), which emptied the flares array and silently hid the card
- Flares now detected from NOAA GOES-18 X-ray flux (0.1-0.8nm, 7-day feed, no auth): peak-detection state machine classifies C/M/X flares with magnitudes; NASA DONKI demoted to fallback with explicit 7-day range
- Added 7-day X-ray Flux area chart to desktop Solar page (log scale, A/B/C/M/X threshold lines, day gridlines)
- Recent Solar Flares card now always renders (empty-state message when no flares) and shows magnitude labels
- Removed Yoga field from Vedic Panchang across core types, Kundlit client, desktop and mobile UI
- Removed fake transits mapping in fetchDailyData (sky-event types were being passed off as planet transits); getSkyEvents remains exported but unused by DailyData
- Rebuilt all distributables and consolidated into root release/ per Release Artifacts Rule (electron-builder emits ia32-named installer + combined Setup.exe; ia32 renamed to -x86, combined deleted)

**Files/Components:**
- packages/core/src/api/planets.ts (new), packages/core/src/api/noaa.ts, packages/core/src/api/index.ts
- packages/core/src/types/astrology.ts (PlanetPosition, MoonEvent, PlanetaryEvent), packages/core/src/types/solar.ts (XrayFluxPoint, SolarFlare.magnitude, optional sourceLocation, SolarData.xrayFlux)
- apps/desktop/src/renderer/components/PlanetaryChart.tsx (new), components/XrayChart.tsx (new)
- apps/desktop/src/renderer/pages/TodayPage.tsx, pages/SolarPage.tsx, styles.css
- apps/mobile/components/PlanetaryChart.tsx (new), app/index.tsx
- release/AstroSet-Setup-x86.exe, AstroSet-Setup-x64.exe, AstroSet-android.apk (rebuilt)

**Important Notes:**
- astronomy-engine Ecliptic() returns elon/elat (not lon/lat); GeoVector+Ecliptic used for precision ecliptic longitudes
- GOES flare detection: event opens at flux >= 1e-6 (C-class), closes after 20 min below half-peak; B-class and below intentionally excluded to keep lists meaningful
- electron-builder artifactName uses ${arch} = "ia32"; rename to "-x86" when consolidating into release/
- Verified live: 45 flares detected incl. C6.7 same-day; positions match current sky (Sun 28 Leo, Saturn/Neptune/Pluto retrograde)

### Modification 011
**Date:** 2026-08-21

**Changes:**
- Redesigned desktop Today section tiles (Tile Design System v2)
- Category accent system: each tile carries an accent color via modifier class (card--astro purple, card--solar orange, card--aurora green, card--weather blue) driving a top gradient bar, hover border glow, and tinted icon chip
- Icon chips: emoji icons now sit in rounded 38px tinted squares instead of floating bare
- Hover interaction: tiles lift 2px with accent-tinted border and drop shadow
- Planetary Alignment promoted to full-width hero tile at top of Today page
- Vedic Panchang rendered as 3-column key-value chip grid instead of stacked text lines
- Kp Index / Solar Wind / Aurora / Weather restyled as stat tiles: big value + inline unit suffix + severity badge aligned right in a stat row
- Moon Events and Planetary Events rendered as vertical timelines (accent dots + connecting line)
- Horoscope and Recent Events span full width; event items get severity-colored left borders
- Grid uses dense packing so wide tiles backfill without gaps

**Files/Components:**
- apps/desktop/src/renderer/pages/TodayPage.tsx (restructured tile markup)
- apps/desktop/src/renderer/styles.css (card base upgrade, category accents, kv-grid, timeline, stat-row, chip-row, sev-* borders)
- release/AstroSet-Setup-x86.exe, AstroSet-Setup-x64.exe (rebuilt; APK unchanged - no mobile code modified)

**Important Notes:**
- color-mix() used for hover borders - supported by Electron 34 (Chromium 132)
- Base .card changes apply app-wide (Solar/Weather pages inherit new look via default --card-accent)

### Modification 012
**Date:** 2026-08-21

**Changes:**
- Moved Vedic Panchang directly under Moon Phase: both tiles wrapped in a card-stack container occupying a single grid column so they stack vertically instead of sitting side-by-side
- Today's Weather promoted to full-width tile to keep grid rows evenly paired (stack + Moon Events / Planetary Events + Kp / Solar Wind + Aurora / Weather wide / Recent Events wide)
- Added .card-stack CSS (flex column, 16px gap)

**Files/Components:**
- apps/desktop/src/renderer/pages/TodayPage.tsx, styles.css
- release/AstroSet-Setup-x86.exe, AstroSet-Setup-x64.exe (rebuilt; APK unchanged)

**Important Notes:**
- Grid dense packing previously placed Moon Phase and Panchang side-by-side; explicit stacking guarantees the requested vertical order regardless of window width

### Modification 013
**Date:** 2026-08-21

**Changes:**
- Removed the boxed key-value chip tiles inside the Vedic Panchang card
- Tithi / Nakshatra / Karana now render as plain stacked text lines (label + value) with no inner boxes
- Replaced .kv-grid/.kv CSS with lightweight .panchang-rows styling

**Files/Components:**
- apps/desktop/src/renderer/pages/TodayPage.tsx, styles.css
- release/AstroSet-Setup-x86.exe, AstroSet-Setup-x64.exe (rebuilt; APK unchanged)

**Important Notes:**
- kv-grid classes removed from styles.css; no other page used them

### Modification 014
**Date:** 2026-08-21

**Changes:**
- Added the 7-day X-Ray Flux area chart to the mobile Solar screen (previously desktop-only since Mod 010)
- Created apps/mobile/components/XrayChart.tsx: react-native-svg port of the desktop chart with log-scale Y axis (1e-8 to 1e-3 W/m2), dashed A/B/C/M/X class threshold lines with colored labels, day-boundary gridlines with date labels, amber gradient area fill and flux line
- Wired into apps/mobile/app/solar.tsx as a card between Solar Activity Overview and Kp Index; renders when data.xrayFlux has more than 1 point; caption notes GOES-18 0.1-0.8 nm channel and log scale
- Rebuilt Android APK (82.4 MB) and consolidated to release/AstroSet-android.apk per Release Artifacts Rule

**Files/Components:**
- apps/mobile/components/XrayChart.tsx (new)
- apps/mobile/app/solar.tsx
- release/AstroSet-android.apk (rebuilt)

**Important Notes:**
- No core/API/cache changes: getSolarData() already returned xrayFlux in SolarData; mobile was simply not rendering it
- Mobile chart uses a smaller viewBox (340x190 vs desktop 700x230) so SVG text stays legible at phone widths when scaled
- Windows installers unchanged - no desktop code modified

### Modification 015
**Date:** 2026-08-21

**Changes:**
- Added Schumann Resonance section to the Solar page on desktop and mobile (full-width card)
- Card shows: ResonanceOne composite Activity Index 0-100 with severity badge and label, SR amplitude index, 7.83 Hz fundamental frequency chip line, plain-language summary paragraph
- Live Tomsk State University spectrogram embedded as image card (Space Observing System sos70.ru feed, station time UTC+7 noted in caption)
- New core API client packages/core/src/api/schumann.ts: getSchumannData() fetches ResonanceOne /api/now JSON + Tomsk spectrogram JPEG in parallel via Promise.allSettled; both fail -> throws, single failure -> partial data with missing piece rendered as explicit "unavailable" state
- Spectrogram bytes converted to base64 data URI with environment-agnostic manual base64 encoder (no btoa dependency); JPEG magic-byte validation rejects mislabeled non-image responses (sos70.ru serves the JPEG with a text/html Content-Type header)
- New type SchumannData in types/solar.ts; exported from api/index.ts
- Desktop: separate cachedFetch('astroset:schumann') in App.tsx (NOT inside the daily payload cache - the ~490KB base64 string would bloat the daily localStorage entry), refreshed every 30 min alongside daily data and on manual refresh; passed to SolarPage as prop
- Mobile: same separate cachedFetch key in app/solar.tsx with its own loader wired into interval refresh and pull-to-refresh; RN Image with resizeMode contain

**Files/Components:**
- packages/core/src/api/schumann.ts (new), packages/core/src/api/index.ts, packages/core/src/types/solar.ts
- apps/desktop/src/renderer/App.tsx, pages/SolarPage.tsx, styles.css (.spectrogram, .schumann-summary)
- apps/mobile/app/solar.tsx
- release/AstroSet-Setup-x86.exe, AstroSet-Setup-x64.exe, AstroSet-android.apk (rebuilt)

**Important Notes:**
- Sources verified live: ResonanceOne returns activity_index/schumann_index/summary JSON (CORS-open, hourly); Tomsk spectrogram updates every few minutes at https://sos70.ru/provider.php?file=shm.jpg
- HeartMath GCMS has no public real-time API; schumannresonancelive.com endpoint returned HTML not JSON - both rejected
- Spectrogram times are Tomsk local (UTC+7); attribution caption included on both platforms per source requirements

### Modification 016
**Date:** 2026-08-21

**Changes:**
- Fixed desktop Schumann Resonance spectrogram never rendering (stats loaded, image always showed "Live spectrogram unavailable right now")
- Root cause 1 (CORS): sos70.ru sends no Access-Control-Allow-Origin header, so the Electron renderer's fetch() was blocked by Chromium before the JPEG bytes could be read
- Root cause 2 (CSP): renderer meta CSP had no img-src directive; default-src 'self' https: does not permit data: URIs, so even a successful base64 data-URI <img> would have been blocked
- Fix 1: apps/desktop/src/main/main.ts now registers session.defaultSession.webRequest.onHeadersReceived in app.whenReady() injecting Access-Control-Allow-Origin: * ONLY for https://sos70.ru/* responses; every other URL passes through with callback({}) unmodified
- Fix 2: index.html CSP extended with explicit "img-src 'self' data: https:"
- Verified compiled output contains both fixes; packaged app smoke-tested (process alive 20s, no startup regression)
- Rebuilt and reconsolidated Windows installers to release/ per Release Artifacts Rule

**Files/Components:**
- apps/desktop/src/main/main.ts (CORS hook + TOMSK_SPECTROGRAM_ORIGIN constant)
- apps/desktop/src/renderer/index.html (img-src CSP directive)
- release/AstroSet-Setup-x86.exe, AstroSet-Setup-x64.exe (rebuilt)

**Important Notes:**
- Mobile unaffected by this bug: React Native fetch/Image do not enforce CORS, so the APK was not rebuilt
- Any cached partial SchumannData entry self-heals: next successful network refresh overwrites the cache with full data including spectrogramUri

### Modification 017
**Date:** 2026-08-21

**Changes:**
- Fixed Daily Horoscope always showing "No horoscope available": CosmyDay API renamed its response field from description/horoscope to content (API still alive, HTTP 200)
- getDailyHoroscope now maps data.content first; throws when no content string is present so fetchDailyData's .catch(() => null) hides the card cleanly instead of rendering the fallback text
- lucky_number/lucky_color/mood fields are gone from the API response; optional chips simply do not render
- Desktop Solar page restructure: merged Planetary Kp Index + Aurora Forecast + Solar Flares count tiles into a single "Space Weather Summary" card with a 3-stat row (.stat-trio/.trio-item/.trio-label, divider borders between stats)
- Removed the "Geomagnetic Storms / active storms" count tile from desktop Solar page (storms list card retained)
- X-Ray Flux chart and Schumann Resonance cards changed from span-2 to true full width via new .card-full class (grid-column: 1 / -1) so the spectrogram renders larger and its axis labels are readable
- Mobile Solar screen parity: merged Kp Index and Aurora Forecast cards into one "Space Weather Summary" card adding a Flares count stat; removed the separate Aurora card (mobile has no storms-count tile; charts already full-width there)
- Rebuilt x86/x64 installers and Android APK; consolidated to root release/

**Files/Components:**
- packages/core/src/api/cosmyday.ts
- apps/desktop/src/renderer/pages/SolarPage.tsx, styles.css (.card-full, .stat-trio, .trio-item, .trio-label)
- apps/mobile/app/solar.tsx (+ summaryRow/summaryItem/summaryDivider/summaryLabel/summaryValue/summarySub styles)
- release/AstroSet-Setup-x86.exe, AstroSet-Setup-x64.exe, AstroSet-android.apk (rebuilt)

**Important Notes:**
- Hermes bytecode stores emoji-prefixed JSX strings as UTF-16LE; ASCII substring searches of index.android.bundle give false negatives. Verify with UTF-16LE byte search or plain JS bundles only
- CosmyDay horoscope response also carries rich sky-position data (sky object) currently unused

### Modification 018
**Date:** 2026-08-21

**Changes:**
- Today page (desktop + mobile): merged Moon Phase and Vedic Panchang into a single "Moon Phase & Vedic Panchang" card (phase value + illumination line, then Tithi/Nakshatra/Karana rows); removed the .card-stack wrapper and its CSS class
- Today page: removed the standalone Kp Index tile from both platforms (Kp remains in the Solar page Space Weather Summary card)
- Today page: moved Today's Weather to position 2; new order on both platforms: Planetary Alignment, Today's Weather, Moon Phase & Vedic Panchang, Daily Horoscope, Upcoming Moon Events, Upcoming Planetary Events, Solar Wind, Aurora Forecast, Recent Events
- Solar page reorder per spec on both platforms: Space Weather Summary, Solar Wind, X-Ray Flux, Schumann Resonance, Solar Activity Overview, Recent Solar Flares, Geomagnetic Storms
- Settings: removed the Theme picker from desktop SettingsPage (form state + save payload + UI) and mobile settings.tsx (section + themeGrid/themeItem/themeItemActive/themeText/themeTextActive styles); core UserSettings.theme field retained untouched since nothing else consumes it
- Rebuilt x86/x64 installers and Android APK; consolidated to root release/

**Files/Components:**
- apps/desktop/src/renderer/pages/TodayPage.tsx, pages/SolarPage.tsx, pages/SettingsPage.tsx, styles.css
- apps/mobile/app/index.tsx, app/solar.tsx, app/settings.tsx
- release/AstroSet-Setup-x86.exe, AstroSet-Setup-x64.exe, AstroSet-android.apk (rebuilt)

**Important Notes:**
- updateSettings merges partials, so dropping theme from the save payload preserves the stored value ('system' default)
- Bundle verification must use UTF-16LE byte search for emoji-prefixed strings; plain ASCII words like "Theme" always match library code (ThemeProvider etc.) and are useless as markers

### Modification 019
**Date:** 2026-08-23

**Changes:**
- Fixed mobile Today page Planetary Alignment legend column alignment
- Legend rows now use exact 50% width two-column layout with fixed glyph/name/℞ slots and flex degree-sign column
- Retrograde ℞ slot always reserved (hidden via opacity when not retrograde) so non-Rx rows stay aligned with Rx rows

**Files/Components:**
- apps/mobile/components/PlanetaryChart.tsx
- release/AstroSet-android.apk (rebuilt)

**Important Notes:**
- Windows installers unchanged - desktop legend layout not modified

### Modification 020
**Date:** 2026-08-25

**Changes:**
- Fixed settings resetting to defaults on every app restart (both platforms): the core settings store was memory-only
- packages/core/src/cache.ts: exported getActiveStorage() accessor for the configured storage adapter (localStorage desktop / AsyncStorage mobile)
- packages/core/src/stores/settings.ts: added saveSettings(partial) which merges + persists JSON under key `astroset:settings`, and loadSettings() which reads and merges stored settings over DEFAULT_SETTINGS; corrupt stored JSON now throws to the caller instead of silently defaulting; legacy updateSettings/getSettings/resetSettings kept untouched
- Desktop App.tsx: settings state starts null, render gated behind existing loading screen until loadSettings() resolves; handleSaveSettings awaits saveSettings; removed manual loadData/loadSchumann calls after save (settings change refires the [loadData] effect automatically)
- Desktop SettingsPage: new saving/saveError props, inline red error banner (.settings-save-error CSS), Save button disabled with "Saving..." label while persisting
- Mobile _layout.tsx: tab rendering gated behind a one-time loadSettings() await (spinner) so every screen's getSettings() reads persisted values
- Mobile settings.tsx: save is async via saveSettings with failure Alert; button disabled while saving

**Files/Components:**
- packages/core/src/cache.ts, packages/core/src/stores/settings.ts
- apps/desktop/src/renderer/App.tsx, pages/SettingsPage.tsx, styles.css
- apps/mobile/app/_layout.tsx, app/settings.tsx

**Important Notes:**
- Cache keys already include location/zodiac params; stale cached data from old settings never serves after a settings change

### Modification 021
**Date:** 2026-08-25

**Changes:**
- Added AdMob banner ads to the Android app (mirrors Vortex Music Editor pattern): react-native-google-mobile-ads pinned to 14.11.0, Expo config plugin added to app.json with androidAppId ca-app-pub-5921736157259166~8198839586
- apps/mobile/ads.ts: single source of ad IDs; __DEV__ builds automatically use Google's always-fill test banner (ca-app-pub-3940256099942544/6300978111), release builds use the real unit ID ca-app-pub-5921736157259166/3878496791; initAds() = SDK initialize + UMP consent flow (requestInfoUpdate -> loadAndShowConsentFormIfRequired when REQUIRED)
- apps/mobile/components/AdBanner.tsx: ANCHORED_ADAPTIVE_BANNER in a 62dp reserved-height container with muted "Ad" placeholder until onAdLoaded; whole banner collapses on load failure so no empty bar remains
- AdBanner wired bottom-pinned into all 4 tabs (Today, Solar, Weather, Settings); screens wrapped in flex:1 View with ScrollView above the banner
- Rebuilt Windows installers (x86+x64, renderer changed for Mod 020) and Android APK (86.7 MB); consolidated to root release/

**Files/Components:**
- apps/mobile/app.json, apps/mobile/ads.ts (new), apps/mobile/components/AdBanner.tsx (new)
- apps/mobile/app/_layout.tsx, app/index.tsx, app/solar.tsx, app/weather.tsx, app/settings.tsx
- apps/mobile/android/ (regenerated manifest meta-data via expo prebuild)
- release/AstroSet-android.apk, AstroSet-Setup-x86.exe, AstroSet-Setup-x64.exe (rebuilt)

**Important Notes:**
- USER DECISION: IDs are reused from Vortex Music Editor publisher account pub-5921736157259166 - policy risk accepted (mixed analytics/attribution between the two apps; AdMob prefers one app entry per store listing). Swap by editing apps/mobile/ads.ts only.
- v16.x of the library is INCOMPATIBLE with RN 0.76: its specs use namespaced CodegenTypes.UnsafeObject which RN 0.76 codegen cannot parse (UnsupportedGenericParserError); 14.x uses bare UnsafeObject which RN 0.76 supports natively
- Folder rename astroset -> "Vortex Astroset" pushed New Architecture C++ codegen object paths past Windows MAX_PATH 260 (ninja: Filename longer than 260 characters). ninja 1.10.2 has a hard-coded software check that longPathAware manifests cannot bypass. FIXED by replacing E:\AITools\android-sdk\cmake\3.22.1\bin\ninja.exe with ninja 1.12.1 from GitHub releases (original kept as ninja.exe.bak). If the Android SDK is reinstalled/repaired, re-apply this ninja swap or builds will fail again on this folder path.
- The earlier pnpm virtual-store error (dependencies linked from E:\AIprojects\Safety App\astroset) was resolved with a full pnpm install relink at the new folder location
- Real ad serving unverified on device; dev builds always serve test ads by design

### Modification 022
**Date:** 2026-08-25

**Changes:**
- Bumped application version from 1.0.0 to 1.1.0 (settings persistence + AdMob release)
- Android versionCode 1 -> 2; versionName 1.1.0
- Rebuilt x86/x64 installers and Android APK; consolidated to root release/

**Files/Components:**
- package.json, packages/core/package.json, apps/desktop/package.json, apps/mobile/package.json
- apps/mobile/app.json (version + android.versionCode)
- apps/mobile/android/app/build.gradle (versionCode/versionName)
- release/AstroSet-Setup-x86.exe, AstroSet-Setup-x64.exe, AstroSet-android.apk

**Important Notes:**
- App version is 1.1.0; ninja 1.12.1 is only the Android SDK build tool (not the app version)

### Modification 023
**Date:** 2026-08-25

**Changes:**
- AdMob testability: FORCE_TEST_ADS=true so release APK serves Google sample banners (always fill) instead of live unit no-fills that hid the slot
- AdBanner always keeps a reserved 62dp slot with visible status (starting / loading / failed + tap-to-retry); no longer collapses to null on failure
- Waits for ensureAdsReady() before mounting BannerAd; Settings shows AdMob mode + unit suffix + instructions
- Banner also shown on loading/error screens so the slot is never missing

**Files/Components:**
- apps/mobile/ads.ts, components/AdBanner.tsx, app/_layout.tsx, app/settings.tsx, app/index.tsx, app/solar.tsx, app/weather.tsx
- release/AstroSet-android.apk

**Important Notes:**
- Set FORCE_TEST_ADS=false in ads.ts before Play Store / real monetization

### Modification 024
**Date:** 2026-08-25

**Changes:**
- Settings save now triggers data refresh: core getSettingsRevision() bumps on saveSettings/updateSettings/resetSettings
- Mobile Today + Weather use useFocusEffect to reload when revision changed after leaving Settings
- Desktop already refetched via settings state dependency on loadData (unchanged)

**Files/Components:**
- packages/core/src/stores/settings.ts
- apps/mobile/app/index.tsx, app/weather.tsx, app/settings.tsx
- release/AstroSet-android.apk

**Important Notes:**
- Solar tab is location-independent and does not reload on settings change

### Modification 025
**Date:** 2026-08-25

**Changes:**
- Data accuracy audit + fixes after live cross-validation of all API/on-device sources
- CRITICAL: getSolarWind() was reading data[length-1] but NOAA RTSW JSON is newest-first — app showed ~24h-stale solar wind; now picks newest row by time_tag
- HIGH: Bz was hardcoded 0; now fetched from rtsw_mag_1m.json (bz_gsm); type is number | null; UI hides Bz when null
- Moon illumination/age now computed exactly via astronomy-engine Illumination() + SearchMoonPhase (was crude tithi*7 heuristic and age always 0)
- Kundlit panchanga timezone no longer hardcoded Asia/Kolkata: fetchDailyData uses Open-Meteo auto-resolved IANA timezone; panchang/moonPhase skipped if weather/tz unavailable (no silent wrong-tz fallback)
- UI: "As of" timestamps on solar wind + Kp; horoscope shows API date ("For YYYY-MM-DD")

**Files/Components:**
- packages/core/src/api/noaa.ts, packages/core/src/api/vedastro.ts, packages/core/src/api/index.ts
- packages/core/src/types/solar.ts (SolarWindData.bz: number | null)
- apps/desktop/src/renderer/pages/TodayPage.tsx, pages/SolarPage.tsx
- apps/mobile/app/solar.tsx, app/index.tsx
- release/AstroSet-Setup-x86.exe, AstroSet-Setup-x64.exe, AstroSet-android.apk (rebuilt)

**Important Notes:**
- Live verified post-fix: newest wind ~363 km/s vs old stale ~399; real Bz ~3.7 nT; illumination ~90.2% (was ~84%)
- Planetary positions, moon events, Kundlit tithi/nakshatra, GOES flare detection were already accurate (cross-checked against ephemeris / published tables / raw flux)

### Modification 026
**Date:** 2026-08-27

**Changes:**
- Generated additional icon sizes from existing 1024x1024 PNGs using Python Pillow (Lanczos resampling)
- Created 512x512 and 144x144 versions of both icon and icon-mark

**Files/Components:**
- media/icons/icon-512.png (new)
- media/icons/icon-144.png (new)
- media/icons/icon-mark-512.png (new)
- media/icons/icon-mark-144.png (new)

**Important Notes:**
- No application code changes; media assets only
- No build required; icon files are reference assets

### Modification 028
**Date:** 2026-08-27

**Changes:**
- Generated mobile-view screenshots of all 4 screens (Today, Solar, Weather, Settings) at 7 resolutions
- Created faithful HTML mockups matching the React Native styling (colors, fonts, layout, data)
- Used Playwright + Chromium to capture screenshots at: 800x480, 1024x600, 1280x720, 1280x800, 1920x1080, 1920x1200, 2560x1600
- Total: 28 PNG screenshots

**Files/Components:**
- media/screenshots/ (new directory, 28 PNG files)
- media/screenshots/take_screenshots.py (Python Playwright script for regeneration)

**Important Notes:**
- Installed react-native-web and react-dom as dependencies for web export attempt (blocked by native-only google-mobile-ads module)
- Screenshots are based on live API data patterns verified in Modification 025
- Script can be re-run to regenerate screenshots with updated data

### Modification 027
**Date:** 2026-08-27

**Changes:**
- Generated 114x114 icon sizes from existing 1024x1024 PNGs using Python Pillow (Lanczos resampling)
- Created 114x114 versions of both icon and icon-mark

**Files/Components:**
- media/icons/icon-114.png (new)
- media/icons/icon-mark-114.png (new)

**Important Notes:**
- No application code changes; media assets only
- No build required; icon files are reference assets

### Modification 029
**Date:** 2026-08-27

**Changes:**
- Generated Play Store submission assets: phone screenshots, 7-inch tablet screenshots, 10-inch tablet screenshots, feature graphic
- Built signed Android App Bundle (AAB) for Play Store submission
- Created release keystore and configured Gradle signing config
- Generated phone screenshots (3 images, 1080x1920): Today, Solar, Weather
- Generated 7-inch tablet screenshots (4 images, 1080x1920): Today, Solar, Weather, Settings
- Generated 10-inch tablet screenshots (4 images, 1600x2560): Today, Solar, Weather, Settings
- Generated feature graphic (1 image, 1024x500)
- Built AAB: 55 MB signed bundle (app-release.aab)
- Consolidated all artifacts into root release/ folder with subdirectories

**Files/Components:**
- apps/mobile/android/app/release.keystore (new, gitignored)
- apps/mobile/android/keystore.properties (new, gitignored)
- apps/mobile/android/app/build.gradle (added release signing config)
- apps/mobile/android/app/build/outputs/bundle/release/app-release.aab (built)
- release/AstroSet-android.aab (new, 55 MB)
- release/phone/ (3 phone screenshots, 1080x1920)
- release/tablet7/ (4 tablet screenshots, 1080x1920)
- release/tablet10/ (4 tablet screenshots, 1600x2560)
- release/feature_graphic.png (1024x500)
- .gitignore (added *.keystore, keystore.properties)

**Important Notes:**
- Keystore password: astroset2026, alias: astroset-release
- Keystore files excluded from Git via .gitignore
- All screenshots are Playwright-rendered HTML mockups (not live app)
- Phone screenshots are 3 images (no settings) — sufficient for Play Store minimum
- AAB is 55 MB signed bundle ready for Play Store upload
- Play Store submission assets: release/phone/, release/tablet7/, release/tablet10/, release/feature_graphic.png

### Modification 030
**Date:** 2026-08-27

**Changes:**
- Changed Android package name from com.astroset.mobile to com.vortex.astro
- Updated app.json: bundleIdentifier + android.package
- Updated build.gradle: namespace + applicationId
- Updated AndroidManifest.xml: data scheme
- Moved Kotlin source files (MainApplication.kt, MainActivity.kt) to com/vortex/astro/ package
- Rebuilt signed AAB (55 MB) with new package name
- Updated release/ artifacts

**Files/Components:**
- apps/mobile/app.json (bundleIdentifier, package)
- apps/mobile/android/app/build.gradle (namespace, applicationId)
- apps/mobile/android/app/src/main/AndroidManifest.xml (data scheme)
- apps/mobile/android/app/src/main/java/com/vortex/astro/MainApplication.kt (moved)
- apps/mobile/android/app/src/main/java/com/vortex/astro/MainActivity.kt (moved)
- release/AstroSet-android.aab (rebuilt)

**Important Notes:**
- New package name: com.vortex.astro
- Old directory apps/mobile/android/app/src/main/java/com/astroset/ removed
- Clean build (app/build/) performed before rebuild to ensure Gradle picks up namespace change

### Modification 031
**Date:** 2026-08-27

**Changes:**
- Enabled R8/ProGuard code shrinking and obfuscation for Android release builds (was disabled by default)
- Rebuilt signed AAB (50.6 MB) with R8 minification enabled — reduced from 55 MB
- Generated mapping.txt deobfuscation file (34.8 MB) for crash/ANR analysis in Play Console
- Consolidated AAB and mapping.txt into root release/

**Files/Components:**
- apps/mobile/android/app/build.gradle (enableProguardInReleaseBuilds = true)
- release/AstroSet-android.aab (rebuilt, 50.6 MB with R8)
- release/AstroSet-android-mapping.txt (new, 34.8 MB)

**Important Notes:**
- Upload mapping.txt to Google Play Console alongside AAB to deobfuscate crash reports
- proguard-rules.pro already had keep rules for react-native-reanimated and turbomodule
- AAB size reduced by ~4.4 MB due to R8 bytecode shrinking and unused code removal

### Modification 032
**Date:** 2026-08-31

**Changes:**
- Retroactive documentation of an undocumented dependency/version upgrade that moved the Android app to 1.3.0/versionCode 5 (code had advanced past the last recorded 1.1.0 state).
- Actual current versions (recorded from config for accuracy; prior Mod entries did not capture these):
  - Expo SDK 57 (~57.0.18), React Native 0.86.3, React/React-DOM 19.2.3
  - react-native-google-mobile-ads ^16.5.0 (same library, upgraded from 14.11.0)
  - TypeScript ^6.0.3 (mobile), expo-router ~57.0.17, async-storage ^2.2.0
  - compileSdk/targetSdk 36, buildTools 36.0.0, minSdk 24; New Architecture + Hermes enabled
  - Android package com.vortex.astro; app version 1.3.0, versionCode 5
- Git repository was NOT initialized (verified); this is a known gap vs Section 11 of project rules.

**Files/Components:**
- apps/mobile/package.json, apps/mobile/app.json, apps/mobile/android/app/build.gradle
- package.json (root, currently 1.2.0), apps/desktop/package.json (1.2.0), packages/core/package.json (1.2.0)

**Important Notes:**
- Version strings were inconsistent across packages (1.2.0 root/desktop/core vs 1.3.0 mobile). Aligned to 1.3.0 in a later modification.
- Google Play rejected the app on Target API/SDK, Data safety/privacy policy, and app version/levels. Remediation tracked in AGENTS_PLAN.md.
- No privacy policy existed anywhere; app stores location + zodiac prefs locally and uses AdMob — a hosted privacy policy URL is required for resubmission.
- apps/mobile/ads.ts has FORCE_TEST_ADS=true which forces Google sample banners in release builds (must be false for production).
- AdMob App ID/unit were reused from the Vortex Music Editor publisher account (policy-risk; dedicated AstroSet AdMob app planned).

### Modification 033
**Date:** 2026-08-31

**Changes:**
- Play Store rejection remediation (plan tracked in AGENTS_PLAN.md "Current Track"): addressed Target API/SDK, Data safety / privacy policy, and app version/levels rejections.
- Phase 0: Synced AGENTS_PLAN.md + AGENTS.md to reflect current 1.3.0 state.
- Phase 1: Privacy & Data Safety — added in-app Privacy Policy screen (apps/mobile/app/privacy.tsx) plus a Settings link to it.
- Phase 2: Ads — set FORCE_TEST_ADS=false in apps/mobile/ads.ts; added dedicated AstroSet AdMob placeholder identifiers in ads.ts / app.json / AndroidManifest.
- Phase 3: Version — aligned 1.3.0 across root and packages/core package.json.
- Phase 4: Android versionCode 5 -> 6 (app.json + build.gradle). versionName remains 1.3.0.
- Phase 5: Rebuilt signed release AAB/APK with patched deps; consolidated all three artifacts (AstroSet-android.apk / .aab / -mapping.txt) into root release/.
- Desktop app fully removed (apps/desktop/ and root desktop installers deleted); root package.json scripts cleaned to mobile-only; AGENTS.md rewritten mobile-only.
- Build fixes recorded: Gradle wrapper 9.3.1 -> 8.14.3; react-native-google-mobile-ads 16.5.0 -> 15.8.3; durable pnpm patch for expo-modules-core 57.0.14 worklet integration.

**Files/Components:**
- apps/mobile/app/privacy.tsx (new in-app privacy policy), apps/mobile/app/settings.tsx (privacy link)
- apps/mobile/ads.ts, apps/mobile/app.json, apps/mobile/android/app/src/main/AndroidManifest.xml (AdMob IDs)
- package.json, packages/core/package.json, apps/mobile/package.json (version 1.3.0)
- apps/mobile/android/app/build.gradle (versionCode 6), gradle/wrapper/gradle-wrapper.properties (8.14.3)
- patches/expo-modules-core@57.0.14.patch (new)
- release/AstroSet-android.apk, release/AstroSet-android.aab, release/AstroSet-android-mapping.txt (rebuilt)
- medial_support.txt (updated mobile-only, ads + privacy features)

**Important Notes:**
- Durable pnpm patch disables Expo worklets integration (enableWorkletsIntegration=false) because expo-modules-core 57.0.14 calls runtime->executeSync() which no longer exists in react-native-worklets 0.12.1 (renamed runSync). App uses reanimated's worklets, not expo's, so this is safe. worklets cannot be downgraded (reanimated 4.6.0 hard-requires 0.12.x).
- Still blocked for actual Play resubmission on external resources: hosted public Privacy Policy URL + filled Data safety form, and a dedicated AstroSet AdMob App ID/unit.


### Modification 034
**Date:** 2026-08-31

**Changes:**
- Removed AdMob entirely to resolve the Play Store "Data safety / ads" rejection track and simplify the privacy story (monetization deferred).
- Deleted apps/mobile/ads.ts and apps/mobile/components/AdBanner.tsx; stripped all imports/usages across app/_layout.tsx, app/index.tsx, app/solar.tsx, app/weather.tsx, app/settings.tsx.
- Removed react-native-google-mobile-ads from apps/mobile/package.json (pnpm install dropped 21 packages); removed app.json config plugin; `expo prebuild --platform android` cleared the ads meta-data from the regenerated AndroidManifest.
- Fixed the "app version and levels" rejection: versionName 1.3.0 -> 1.3 and versionCode 6 -> 7 in app.json + build.gradle; root package.json version -> 1.3. (A trailing `.0` is the likely rejection trigger; Android forbids a trailing `.0` on versionName.)
- Previous release keystore had been LOST (wiped by an earlier expo prebuild). Generated a NEW keystore (apps/mobile/android/app/release.keystore, RSA 2048, 10000 days) + android/keystore.properties. Safe because the app was never accepted/published, so the old key is not bound to Play App Signing.
- Re-applied after prebuild wiped them: release signing config (keystore.properties), `minifyEnabled true` + `shrinkResources true` (R8), and gradle wrapper 8.14.3.
- Rebuilt core + signed AAB/APK (BUILD SUCCESSFUL); verified the bundle contains no `com.google.android.gms.ads`, no "AdMob", and no advertiser strings. Consolidated to root release/.

**Files/Components:**
- apps/mobile/ads.ts, components/AdBanner.tsx (deleted)
- apps/mobile/app/_layout.tsx, app/index.tsx, app/solar.tsx, app/weather.tsx, app/settings.tsx (ads stripped)
- apps/mobile/package.json, apps/mobile/app.json (ads dep + plugin removed)
- apps/mobile/android/app/src/main/AndroidManifest.xml (regenerated, no ads meta-data)
- apps/mobile/android/app/release.keystore + android/keystore.properties (NEW, gitignored)
- apps/mobile/android/app/build.gradle (versionName "1.3", versionCode 7, release signing + R8)
- apps/mobile/android/gradle/wrapper/gradle-wrapper.properties (8.14.3)
- apps/mobile/app/privacy.tsx, release/PRIVACY_POLICY.md (rewritten ad-free)
- medial_support.txt (ad-free copy), AGENTS_PLAN.md (removal + deferred monetization recorded)
- release/AstroSet-android.apk, release/AstroSet-android.aab, release/AstroSet-android-mapping.txt (rebuilt)

**Important Notes:**
- Store the NEW keystore (astroset2026 / astroset-release) safely — it is now the signing key for Play App Signing if the app is published.
- App is now completely ad-free; Play Console Data safety form no longer needs ad disclosures.
- Remaining blockers for actual resubmission (external, deferred): host the ad-free public Privacy Policy URL, fill the Data safety form, complete store listing.

### Modification 035
**Date:** 2026-09-13

**Changes:**
- Added EAS Update (OTA) support: apps now receive JavaScript/asset-only updates over-the-air via Expo's update service without a new Play Store build
- Installed expo-updates (~57.0.22) in apps/mobile
- Created EAS project `@kogn12/astroset` (ID `4db59433-266e-4e90-866d-6484bf9d6969`); authenticated via token from `credentials.txt`
- app.json: added `updates` block (`url https://u.expo.dev/4db59433-...`, `enabled`, `checkAutomatically: "ON_LOAD"`), `runtimeVersion` fingerprint policy, `extra.eas.projectId`, `owner: "kogn12"`; version 1.3 -> 1.3.1, versionCode 7 -> 8
- Created apps/mobile/eas.json (build profiles: development/preview/production with channels default/preview; `update.channel` key removed — eas-cli 24.x no longer accepts a top-level `update` block)
- Regenerated native android via `expo prebuild` and re-applied the standard wipe list: release signing config (keystore.properties), `minifyEnabled true` + `shrinkResources true` (R8), gradle wrapper 8.14.3
- Rebuilt signed AAB/APK (BUILD SUCCESSFUL) and consolidated to root release/
- Published initial OTA update to `default` branch/channel (Android update group 73ac4383-708e-4c65-9dec-9e5aa07e6c62, runtime version 61bdafc21e8578b3961c0646dac69aea4d8499d3)
- Initialized Git repository (repo name: `Vortex Astroset`); first commit created. .gitignore updated: credentials.txt, local.properties, android/.gradle/.kotlin/.cxx, release/*.apk|.aab|*-mapping.txt, and a stray locked `cmd.exe` in repo root flagged

**Files/Components:**
- apps/mobile/app.json, apps/mobile/eas.json (new), apps/mobile/package.json (expo-updates), apps/mobile/android/ (regenerated)
- .gitignore, .git/ (new), package.json / packages/core/package.json / apps/mobile/package.json (version 1.3.1)
- release/AstroSet-android.apk, release/AstroSet-android.aab, release/AstroSet-android-mapping.txt (rebuilt)

**Important Notes:**
- expo-updates validates `checkAutomatically` against the JS-facing enum: valid values are `ON_LOAD`, `WIFI_ONLY`, `NEVER`, `ON_ERROR_RECOVERY` — NOT the native values (`ALWAYS`) or the removed `ON_LOAD_AND_SPLASH`. `ON_LOAD` maps to native `ALWAYS` in the manifest (`EXPO_UPDATES_CHECK_ON_LAUNCH`)
- Changing app.json (`checkAutomatically`, version, etc.) changes the runtime fingerprint → the embedded runtimeVersion in the native build changes → builds MUST be regenerated (`expo prebuild`) and rebuilt after any of these edits, or published OTA updates will not match the installed app
- OTA updates only cover JS + assets. Any native dependency/config change requires a full AAB rebuild + Play Store release
- `eas update` from CI/terminal: set `EXPO_TOKEN` env var (token stored in credentials.txt, gitignored). Command: `eas update --channel default --environment production --message "..." --non-interactive` (run from project root)
- EAS Update requires a Git repository; repo was initialized during this modification
- A stray copy of `C:\Windows\System32\cmd.exe` exists in the repo root (byte-identical hash to the system cmd). It is gitignored but could not be deleted (Access denied — likely locked); delete manually if no longer needed
- Known gap: pending Play Store blockers from Mod 034/033 are unchanged; OTA updates are testable via the rebuilt APK

### Modification 036
**Date:** 2026-09-14

**Changes:**
- Deleted the last of the monorepo structure — the project is now a single flat Expo (React Native Android) project at the repo root. No `apps/`, no `packages/`, no Turborepo, no pnpm workspace.
- Moved the whole app up from `apps/mobile/` to the repo root: `app/`, `components/`, `assets/`, `android/`, `app.json`, `eas.json`, `metro.config.js`, `babel.config.js`, `tsconfig.json` are now top-level.
- Moved shared core logic `packages/core/src/` → `src/core/` (deleted empty `src/core/{config,hooks,utils}` dirs and the internal `package.json`).
- Rewrote all 7 importer files from `import ... from '@astroset/core'` to relative `import ... from '../src/core'` (app/_layout.tsx, app/index.tsx, app/solar.tsx, app/weather.tsx, app/settings.tsx, components/PlanetaryChart.tsx, components/XrayChart.tsx). Removed the tsconfig `paths` alias.
- Root `package.json` is now the app manifest: dependencies merged from apps/mobile (incl. `astronomy-engine` moved from core), scripts are direct (`expo start`, `tsc --noEmit`, ...), `turbo` devDep and `build:core` script removed. Removed `@react-navigation/native` and swapped `useFocusEffect` to `expo-router`'s export (SDK 56+ rejects react-navigation imports).
- Deleted `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, the entire `apps/` and `packages/`/ directory. `.gitignore` android cache paths updated (`android/.gradle` etc.). Root `index.js` now serves as both the Metro entry file and the app entry — the old Windows entry-file relativity workaround (Mod 006) no longer applies.
- Kept `patches/expo-modules-core@57.0.14.patch`; pnpm 9 ignores the `pnpm.patchedDependencies` field (warning at install) but the patch is registered in `pnpm-lock.yaml` (`patch_hash=q3wbwvgd...`) and is applied on install — verified `enableWorkletsIntegration = false` in the installed expo-modules-core.
- Removed old `apps/mobile/dist`, `.expo`, and `apps/mobile/node_modules` during deletion; fresh `pnpm install` at root (627 packages). Default expo install scripts run at root.
- Verified: `pnpm typecheck` passes (tsc --noEmit); `expo export --platform android` bundles the app into a Hermes bundle (3.2MB) with zero resolution errors.

**Files/Components:**
- `app/`, `components/`, `assets/`, `android/`, `src/core/` (moved to root)
- `app.json`, `eas.json`, `metro.config.js`, `babel.config.js`, `tsconfig.json`, `package.json`, `pnpm-lock.yaml`, `.gitignore`
- `src/core/` (was `packages/core/src`), `src/hooks/useNotifications.ts` (was `apps/mobile/src/hooks`)
- Deleted: `apps/`, `packages/`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`

**Important Notes:**
- The app now builds from the repo root: `pnpm install`, `pnpm typecheck`, `pnpm android`, `.\android\gradlew.bat :app:assembleRelease :app:bundleRelease`, `eas update ...` all run from root.
- RN gradle autolinking and `expo prebuild` resolve the project root from `package.json`/`app.json` at the repo root; relative relationships inside `android/` are unchanged (still `android/app/...`, `android/gradle/wrapper/...`).
- Restarting from a deleted `pnpm-lock.yaml` will NOT apply the expo-modules-core patch (pnpm 9 no longer reads `patchedDependencies` from package.json). If the lockfile is ever regenerated, re-enable the patch in `pnpm-workspace.yaml` (`patchedDependencies`) and re-run install.
- The SDK 56+ react-navigation check now surfaces at `expo export`/Metro time; the app uses expo-router's `useFocusEffect`, so no react-navigation import remains.
- monorepo history (Mod 001–035) is retained for reference; all path references in old entries are historical and no longer resolve.

### Modification 037
**Date:** 2026-09-14

**Changes:**
- Rebuilt signed release AAB/APK/mapping.txt from the flattened source (same runtime version 1.3.1, versionCode 8); old Mod 035 build artifacts in `release/` were from pre-flatten code and must not be used for Play submission.
- Published a fresh OTA update (`eas update --channel default`, environment production) so the runtime fingerprint matches the rebuilt native build — all future JS-only changes can now ship without a Play Store rebuild.
- Pushed repo to a private GitHub repository (owner `kogn12`) and published the ad-free Privacy Policy to GitHub Pages at `https://kogn12.github.io/astroset/privacy.html`; the Play Console store listing will use this URL.
- Hand off: Play Console runbook provided to user (store listing, data safety, content rating, AAB upload steps).

**Files/Components:**
- `release/AstroSet-android.apk`, `release/AstroSet-android.aab`, `release/AstroSet-android-mapping.txt` (rebuilt)
- GitHub Pages: `https://kogn12.github.io/astroset/privacy.html`

**Important Notes:**
- The privacy policy URL is `https://kogn12.github.io/astroset/privacy.html`; this goes in the Play Console store listing and Data safety form.
- The new AAB embeds the runtime fingerprint that matches the OTA update published in this modification. Any subsequent `eas update` will apply to devices running this build automatically on launch.
- Keystore unchanged (same `astroset2026` / `astroset-release` upload key from Mod 034; Play App Signing takes over once uploaded to Play Console).
