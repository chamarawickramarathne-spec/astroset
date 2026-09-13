"""
Generate Google Play Store 10-inch tablet screenshots for AstroSet.
1600x2560 (9:16 portrait) - scaled-up tablet layout with two-column support.
"""
import os, time
from playwright.sync_api import sync_playwright

OUT = os.path.dirname(os.path.abspath(__file__))

WIDTH = 1600
HEIGHT = 2560

TABLET10_CSS = """
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f0f23;
  color: #e0e0ff;
  width: 1600px;
  height: 2560px;
  overflow: hidden;
}
.screen {
  display: flex;
  flex-direction: column;
  width: 1600px;
  height: 2560px;
}
.header {
  background: #0f0f23;
  padding: 60px 80px 44px;
  border-bottom: 1px solid #3a3a6a;
}
.header h1 {
  font-size: 68px;
  font-weight: 600;
  color: #e0e0ff;
}
.content {
  flex: 1;
  overflow: hidden;
  padding: 0 64px;
}
.live-bar {
  display: flex;
  align-items: center;
  padding: 40px 16px 0;
  gap: 20px;
}
.live-dot {
  width: 20px; height: 20px; border-radius: 50%;
  background: #10b981;
}
.live-text {
  font-size: 32px;
  color: #10b981;
}
.card {
  background: #252547;
  border-radius: 28px;
  padding: 52px;
  margin: 32px 16px 0;
  border: 1px solid #3a3a6a;
}
.card-title {
  font-size: 34px;
  font-weight: 600;
  color: #a0a0cc;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 28px;
}
.card-value {
  font-size: 84px;
  font-weight: 700;
  color: #e0e0ff;
  margin-bottom: 20px;
}
.card-sub {
  font-size: 32px;
  color: #a0a0cc;
}

/* Two-column grid for tablet */
.two-col {
  display: flex;
  gap: 32px;
}
.two-col > .card {
  flex: 1;
  margin: 32px 0 0;
}
.two-col > .card:first-child {
  margin-left: 16px;
}
.two-col > .card:last-child {
  margin-right: 16px;
}

/* Planet rows */
.planet-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  font-size: 34px;
  color: #e0e0ff;
  border-bottom: 1px solid #3a3a6a;
}
.planet-row:last-child { border-bottom: none; }
.planet-name { color: #a0a0cc; }
.retrograde { color: #f1c40f; font-size: 28px; }

/* Summary row */
.summary-row {
  display: flex;
  gap: 0;
}
.summary-item {
  flex: 1;
}
.summary-item + .summary-item {
  border-left: 1px solid #3a3a6a;
  padding-left: 32px;
}
.summary-label {
  font-size: 28px;
  color: #a0a0cc;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 14px;
}
.summary-value {
  font-size: 64px;
  font-weight: 700;
  color: #e0e0ff;
  margin-bottom: 10px;
}
.summary-sub {
  font-size: 28px;
  color: #a0a0cc;
}

/* Stats */
.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  margin-top: 28px;
}
.stat-item { flex: 1; min-width: 45%; }
.stat-label {
  font-size: 28px;
  color: #a0a0cc;
  margin-bottom: 10px;
}
.stat-value {
  font-size: 36px;
  font-weight: 600;
  color: #e0e0ff;
}

/* Meta */
.meta-row {
  display: flex;
  gap: 40px;
  margin-top: 28px;
}
.meta-item {
  font-size: 32px;
  color: #a0a0cc;
}

/* Panchang */
.panchang {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  margin-top: 32px;
}
.panchang-item { flex: 1; min-width: 45%; }
.panchang-label {
  font-size: 28px;
  color: #a0a0cc;
  margin-bottom: 10px;
}
.panchang-value {
  font-size: 34px;
  font-weight: 600;
  color: #e0e0ff;
}

/* Events */
.event-item {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 24px 0;
  border-bottom: 1px solid #3a3a6a;
}
.event-item:last-child { border-bottom: none; }
.event-icon { font-size: 44px; flex-shrink: 0; }
.event-content { flex: 1; }
.event-title {
  font-size: 32px;
  font-weight: 600;
  color: #e0e0ff;
  margin-bottom: 8px;
}
.event-desc {
  font-size: 28px;
  color: #a0a0cc;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 28px;
  font-weight: 600;
}
.badge-green { background: rgba(46,204,113,0.2); color: #2ecc71; }
.badge-yellow { background: rgba(241,196,15,0.2); color: #f1c40f; }
.badge-orange { background: rgba(230,126,34,0.2); color: #e67e22; }

/* Forecast */
.forecast-item {
  display: flex;
  align-items: center;
  padding: 24px 0;
  border-bottom: 1px solid #3a3a6a;
}
.forecast-item:last-child { border-bottom: none; }
.forecast-day { width: 180px; }
.forecast-day-name {
  font-size: 34px;
  font-weight: 600;
  color: #e0e0ff;
}
.forecast-date {
  font-size: 28px;
  color: #a0a0cc;
}
.forecast-emoji { font-size: 52px; margin: 0 24px; }
.forecast-desc { flex: 1; font-size: 32px; color: #a0a0cc; }
.forecast-temps { display: flex; gap: 20px; }
.temp-high { font-size: 34px; font-weight: 600; color: #e74c3c; }
.temp-low { font-size: 34px; color: #a0a0cc; }

/* UV */
.uv-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}
.uv-level { font-size: 34px; font-weight: 600; }
.uv-desc { font-size: 32px; color: #a0a0cc; }

/* Settings */
.section { margin: 48px 16px 0; }
.section-title {
  font-size: 32px;
  font-weight: 600;
  color: #a0a0cc;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 24px;
}
.location-item {
  background: #252547;
  border-radius: 20px;
  padding: 28px;
  border: 1px solid #3a3a6a;
  margin-bottom: 14px;
  font-size: 34px;
  color: #a0a0cc;
}
.location-item.active {
  border-color: #4a9eff;
  background: rgba(74,158,255,0.1);
  color: #4a9eff;
  font-weight: 600;
}
.zodiac-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.zodiac-item {
  background: #252547;
  border-radius: 20px;
  padding: 20px 28px;
  border: 1px solid #3a3a6a;
  font-size: 32px;
  color: #a0a0cc;
}
.zodiac-item.active {
  border-color: #4a9eff;
  background: rgba(74,158,255,0.1);
  color: #4a9eff;
  font-weight: 600;
}
.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #252547;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 14px;
}
.setting-label {
  font-size: 34px;
  color: #e0e0ff;
}
.switch {
  width: 112px; height: 64px; border-radius: 32px;
  background: #4a9eff; position: relative;
}
.switch::after {
  content: ''; position: absolute;
  width: 52px; height: 52px; border-radius: 50%;
  background: white; top: 6px; right: 6px;
}
.save-btn {
  background: #4a9eff;
  border-radius: 20px;
  padding: 38px;
  margin: 56px 16px 48px;
  text-align: center;
  font-size: 38px;
  font-weight: 600;
  color: white;
}

/* Chart */
.chart-area {
  background: #1a1a35;
  border-radius: 20px;
  height: 400px;
  position: relative;
  overflow: hidden;
  margin-top: 10px;
}
.spectrogram-area {
  background: #1a1a35;
  border-radius: 20px;
  height: 400px;
  margin-top: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.schumann-summary {
  font-size: 32px;
  color: #a0a0cc;
  line-height: 44px;
  margin-top: 28px;
}
.schumann-caption {
  font-size: 26px;
  color: #a0a0cc;
  margin-top: 20px;
}

/* Tab bar */
.tab-bar {
  display: flex;
  background: #1a1a3e;
  border-top: 1px solid #3a3a6a;
  justify-content: space-around;
  padding: 20px 0 32px;
  flex-shrink: 0;
}
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 26px;
  color: #a0a0cc;
}
.tab-item.active {
  color: #4a9eff;
}
.tab-item .icon { font-size: 44px; }
"""

# ── TODAY (TABLET 10") ─────────────────────────────────────
TODAY_HTML = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>{TABLET10_CSS}</style></head>
<body>
<div class="screen">
  <div class="header"><h1>Today</h1></div>
  <div class="content">
    <div class="live-bar">
      <div class="live-dot"></div>
      <span class="live-text">Live &bull; Updated 10:32 AM &bull; Next: 29:41</span>
    </div>

    <!-- Planetary Alignment - full width -->
    <div class="card">
      <div class="card-title">&#x1FA90; Planetary Alignment</div>
      <div class="planet-row"><span class="planet-name">&#9737; Sun</span><span>Leo 28&deg;14'</span></div>
      <div class="planet-row"><span class="planet-name">&#9789; Moon</span><span>Aries 15&deg;42'</span></div>
      <div class="planet-row"><span class="planet-name">&#9794; Mars</span><span>Libra 3&deg;11'</span></div>
      <div class="planet-row"><span class="planet-name">&#9795; Mercury</span><span>Virgo 12&deg;58'</span></div>
      <div class="planet-row"><span class="planet-name">&#9792; Venus</span><span>Cancer 21&deg;05'</span></div>
      <div class="planet-row"><span class="planet-name">&#9795; Jupiter</span><span>Gemini 17&deg;33'</span></div>
      <div class="planet-row"><span class="planet-name">&#9796; Saturn <span class="retrograde">&#8470;</span></span><span>Pisces 1&deg;27'</span></div>
      <div class="planet-row"><span class="planet-name">&#9798; Neptune <span class="retrograde">&#8470;</span></span><span>Aries 0&deg;52'</span></div>
      <div class="planet-row"><span class="planet-name">&#9799; Pluto <span class="retrograde">&#8470;</span></span><span>Aquarius 0&deg;41'</span></div>
    </div>

    <!-- Two-column: Weather + Moon -->
    <div class="two-col">
      <div class="card">
        <div class="card-title">&#9728;&#65039; Today's Weather</div>
        <div class="card-value" style="font-size:64px;">32&deg; / 24&deg;</div>
        <div class="card-sub">Partly cloudy with afternoon showers</div>
        <div class="meta-row" style="margin-top:24px;">
          <span class="meta-item">&#x1F4A7; 65%</span>
          <span class="meta-item">&#9728;&#65039; UV: 8</span>
        </div>
      </div>
      <div class="card">
        <div class="card-title">&#x1F319; Moon Phase</div>
        <div class="card-value" style="font-size:58px;">&#x1F319; Waning Gibbous</div>
        <div class="card-sub">90% illuminated &bull; Age: 18.4 days</div>
      </div>
    </div>

    <!-- Panchang -->
    <div class="card">
      <div class="card-title">&#x1F319; Vedic Panchang</div>
      <div class="panchang">
        <div class="panchang-item"><div class="panchang-label">Tithi</div><div class="panchang-value">Krishna Paksha Chaturdashi</div></div>
        <div class="panchang-item"><div class="panchang-label">Nakshatra</div><div class="panchang-value">Shatabhisha</div></div>
        <div class="panchang-item"><div class="panchang-label">Karana</div><div class="panchang-value">Vishti</div></div>
      </div>
    </div>

    <!-- Horoscope -->
    <div class="card">
      <div class="card-title">&#9800; Daily Horoscope</div>
      <div style="font-size:42px; font-weight:600; color:#4a9eff; margin-bottom:14px;">Leo</div>
      <div class="card-sub" style="margin-bottom:14px;">For 2026-08-27</div>
      <div style="font-size:34px; line-height:48px; color:#e0e0ff;">
        Today brings a powerful alignment in your communication sector. The cosmos encourages you to express your creative vision with confidence and clarity. Trust your instincts on important decisions.
      </div>
    </div>
  </div>

  <div class="tab-bar">
    <div class="tab-item active"><span class="icon">&#x1F4C5;</span>Today</div>
    <div class="tab-item"><span class="icon">&#9728;&#65039;</span>Solar</div>
    <div class="tab-item"><span class="icon">&#x1F324;&#65039;</span>Weather</div>
    <div class="tab-item"><span class="icon">&#9881;&#65039;</span>Settings</div>
  </div>
</div>
</body></html>"""

# ── SOLAR (TABLET 10") ─────────────────────────────────────
SOLAR_HTML = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>{TABLET10_CSS}</style></head>
<body>
<div class="screen">
  <div class="header"><h1>Solar</h1></div>
  <div class="content">
    <div class="live-bar">
      <div class="live-dot"></div>
      <span class="live-text">Live &bull; Updated 10:32 AM &bull; Next: 29:41</span>
    </div>

    <!-- Space Weather Summary -->
    <div class="card">
      <div class="card-title">&#x1F4CA; Space Weather Summary</div>
      <div class="summary-row">
        <div class="summary-item">
          <div class="summary-label">Kp Index</div>
          <div class="summary-value">2</div>
          <span class="badge badge-green">Quiet</span>
          <div class="summary-sub" style="margin-top:10px;">As of Aug 27, 10:00 AM</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Aurora</div>
          <div class="summary-value">15%</div>
          <div class="summary-sub">above 67&deg; latitude</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Flares</div>
          <div class="summary-value">12</div>
          <div class="summary-sub">C-class and above</div>
        </div>
      </div>
    </div>

    <!-- Two-column: Solar Wind + Schumann Resonance -->
    <div class="two-col">
      <div class="card">
        <div class="card-title">&#x1F4A8; Solar Wind</div>
        <div class="card-value" style="font-size:64px;">363 km/s</div>
        <div class="stats-grid">
          <div class="stat-item"><div class="stat-label">Density</div><div class="stat-value">4.2 p/cm&sup3;</div></div>
          <div class="stat-item"><div class="stat-label">Bz</div><div class="stat-value">3.7 nT</div></div>
        </div>
        <div class="card-sub" style="margin-top:20px;">As of Aug 27, 10:15 AM</div>
      </div>
      <div class="card">
        <div class="card-title">&#x1F30D; Schumann Resonance</div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div class="card-value" style="font-size:64px;">42/100</div>
          <span class="badge badge-yellow">Moderate</span>
        </div>
        <div class="card-sub">SR amplitude index 12 &bull; 7.83 Hz</div>
      </div>
    </div>

    <!-- X-Ray Flux full width -->
    <div class="card">
      <div class="card-title">&#x1F4C8; X-Ray Flux &mdash; Last 7 Days (GOES-18)</div>
      <div class="chart-area">
        <svg width="100%" height="100%" viewBox="0 0 1440 400" preserveAspectRatio="none">
          <line x1="0" y1="80" x2="1440" y2="80" stroke="#f1c40f" stroke-width="1" stroke-dasharray="10"/>
          <text x="1420" y="74" fill="#f1c40f" font-size="20" text-anchor="end">C</text>
          <line x1="0" y1="40" x2="1440" y2="40" stroke="#e67e22" stroke-width="1" stroke-dasharray="10"/>
          <text x="1420" y="34" fill="#e67e22" font-size="20" text-anchor="end">M</text>
          <line x1="0" y1="10" x2="1440" y2="10" stroke="#e74c3c" stroke-width="1" stroke-dasharray="10"/>
          <text x="1420" y="10" fill="#e74c3c" font-size="20" text-anchor="end">X</text>
          <line x1="205" y1="0" x2="205" y2="400" stroke="#3a3a6a" stroke-width="1"/>
          <line x1="411" y1="0" x2="411" y2="400" stroke="#3a3a6a" stroke-width="1"/>
          <line x1="617" y1="0" x2="617" y2="400" stroke="#3a3a6a" stroke-width="1"/>
          <line x1="822" y1="0" x2="822" y2="400" stroke="#3a3a6a" stroke-width="1"/>
          <line x1="1028" y1="0" x2="1028" y2="400" stroke="#3a3a6a" stroke-width="1"/>
          <line x1="1234" y1="0" x2="1234" y2="400" stroke="#3a3a6a" stroke-width="1"/>
          <defs><linearGradient id="af" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
          </linearGradient></defs>
          <path d="M0,310 L50,315 L100,305 L150,308 L205,300 L250,295 L300,300 L350,288 L411,278 L450,268 L480,220 L495,195 L510,215 L550,240 L617,260 L660,268 L700,280 L750,284 L822,275 L870,268 L920,252 L940,240 L960,250 L1028,268 L1070,275 L1120,268 L1180,270 L1234,278 L1300,270 L1350,262 L1440,262 L1440,400 L0,400Z" fill="url(#af)"/>
          <path d="M0,310 L50,315 L100,305 L150,308 L205,300 L250,295 L300,300 L350,288 L411,278 L450,268 L480,220 L495,195 L510,215 L550,240 L617,260 L660,268 L700,280 L750,284 L822,275 L870,268 L920,252 L940,240 L960,250 L1028,268 L1070,275 L1120,268 L1180,270 L1234,278 L1300,270 L1350,262 L1440,262" fill="none" stroke="#f59e0b" stroke-width="3"/>
          <text x="205" y="390" fill="#a0a0cc" font-size="20" text-anchor="middle">Aug 21</text>
          <text x="411" y="390" fill="#a0a0cc" font-size="20" text-anchor="middle">Aug 22</text>
          <text x="617" y="390" fill="#a0a0cc" font-size="20" text-anchor="middle">Aug 23</text>
          <text x="822" y="390" fill="#a0a0cc" font-size="20" text-anchor="middle">Aug 24</text>
          <text x="1028" y="390" fill="#a0a0cc" font-size="20" text-anchor="middle">Aug 25</text>
          <text x="1234" y="390" fill="#a0a0cc" font-size="20" text-anchor="middle">Aug 26</text>
          <text x="1440" y="390" fill="#a0a0cc" font-size="20" text-anchor="end">Aug 27</text>
        </svg>
      </div>
      <div class="card-sub" style="margin-top:20px;">0.1&ndash;0.8 nm channel, log scale &bull; dashed lines mark flare class thresholds</div>
    </div>

    <!-- Schumann spectrogram full width -->
    <div class="card">
      <div class="card-title">&#x1F30D; Schumann Resonance Spectrogram</div>
      <div class="spectrogram-area">
        <svg width="92%" height="82%" viewBox="0 0 1300 320">
          <rect width="1300" height="320" fill="#0a0a18"/>
          <rect x="0" y="220" width="1300" height="100" fill="#1a0a30" opacity="0.5"/>
          <rect x="0" y="170" width="1300" height="50" fill="#2a1050" opacity="0.4"/>
          <rect x="0" y="120" width="1300" height="50" fill="#401a60" opacity="0.3"/>
          <rect x="0" y="70" width="1300" height="50" fill="#502a40" opacity="0.2"/>
          <rect x="0" y="20" width="1300" height="50" fill="#603a20" opacity="0.15"/>
          <line x1="0" y1="240" x2="1300" y2="240" stroke="#4a9eff" stroke-width="1.5" opacity="0.4"/>
          <text x="12" y="234" fill="#4a9eff" font-size="18">7.83 Hz</text>
          <line x1="0" y1="180" x2="1300" y2="180" stroke="#4a9eff" stroke-width="0.8" opacity="0.3"/>
          <text x="12" y="174" fill="#4a9eff" font-size="18">14.3 Hz</text>
          <text x="30" y="300" fill="#a0a0cc" font-size="18">UTC+7 03:00</text>
          <text x="1150" y="300" fill="#a0a0cc" font-size="18">Now</text>
        </svg>
      </div>
      <div class="schumann-summary">Schumann resonance activity is at moderate levels. The fundamental frequency shows normal oscillation patterns with minor amplitude variations observed in the past few hours.</div>
      <div class="schumann-caption">Tomsk State University SOSRFF (station time UTC+7) &bull; Index: ResonanceOne</div>
    </div>
  </div>

  <div class="tab-bar">
    <div class="tab-item"><span class="icon">&#x1F4C5;</span>Today</div>
    <div class="tab-item active"><span class="icon">&#9728;&#65039;</span>Solar</div>
    <div class="tab-item"><span class="icon">&#x1F324;&#65039;</span>Weather</div>
    <div class="tab-item"><span class="icon">&#9881;&#65039;</span>Settings</div>
  </div>
</div>
</body></html>"""

# ── WEATHER (TABLET 10") ───────────────────────────────────
WEATHER_HTML = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>{TABLET10_CSS}</style></head>
<body>
<div class="screen">
  <div class="header"><h1>Weather</h1></div>
  <div class="content">
    <!-- Two-column: Today + UV Guide -->
    <div class="two-col">
      <div class="card">
        <div class="card-title">&#9728;&#65039; Today's Forecast</div>
        <div style="display:flex;align-items:center;gap:28px;margin-bottom:28px;">
          <span style="font-size:96px;">&#9925;</span>
          <div>
            <div class="card-value" style="font-size:64px;">32&deg; / 24&deg;</div>
            <div class="card-sub">Partly cloudy with showers</div>
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">&#x1F4A7; Precipitation</div>
            <div class="stat-value">65%</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">&#9728;&#65039; UV Index</div>
            <div class="stat-value" style="color:#e67e22;">8 (Very High)</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">&#x1F4A8; Wind</div>
            <div class="stat-value">18 km/h</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">&#x1F4A6; Humidity</div>
            <div class="stat-value">78%</div>
          </div>
        </div>
        <div style="display:flex;gap:40px;margin-top:28px;padding-top:28px;border-top:1px solid #3a3a6a;">
          <span style="font-size:32px;color:#a0a0cc;">&#x1F305; Sunrise: 6:12 AM</span>
          <span style="font-size:32px;color:#a0a0cc;">&#x1F307; Sunset: 6:28 PM</span>
        </div>
      </div>
      <div class="card">
        <div class="card-title">&#9728;&#65039; UV Index Guide</div>
        <div class="uv-item"><span class="uv-level" style="color:#2ecc71;">0-2 Low</span><span class="uv-desc">No protection</span></div>
        <div class="uv-item"><span class="uv-level" style="color:#f1c40f;">3-5 Moderate</span><span class="uv-desc">Wear sunscreen</span></div>
        <div class="uv-item"><span class="uv-level" style="color:#e67e22;">6-7 High</span><span class="uv-desc">Reduce exposure</span></div>
        <div class="uv-item"><span class="uv-level" style="color:#e74c3c;">8-10 Very High</span><span class="uv-desc">Extra protection</span></div>
        <div class="uv-item"><span class="uv-level" style="color:#9b59b6;">11+ Extreme</span><span class="uv-desc">Avoid sun</span></div>
      </div>
    </div>

    <!-- 7-Day Forecast full width -->
    <div class="card">
      <div class="card-title">&#x1F4C5; 7-Day Forecast</div>
      <div class="forecast-item">
        <div class="forecast-day"><div class="forecast-day-name">Today</div><div class="forecast-date">Aug 27</div></div>
        <span class="forecast-emoji">&#9925;</span>
        <span class="forecast-desc">Partly Cloudy</span>
        <div class="forecast-temps"><span class="temp-high">32&deg;</span><span class="temp-low">24&deg;</span></div>
      </div>
      <div class="forecast-item">
        <div class="forecast-day"><div class="forecast-day-name">Thu</div><div class="forecast-date">Aug 28</div></div>
        <span class="forecast-emoji">&#x1F327;&#65039;</span>
        <span class="forecast-desc">Rain Showers</span>
        <div class="forecast-temps"><span class="temp-high">30&deg;</span><span class="temp-low">23&deg;</span></div>
      </div>
      <div class="forecast-item">
        <div class="forecast-day"><div class="forecast-day-name">Fri</div><div class="forecast-date">Aug 29</div></div>
        <span class="forecast-emoji">&#x1F326;&#65039;</span>
        <span class="forecast-desc">Light Rain</span>
        <div class="forecast-temps"><span class="temp-high">29&deg;</span><span class="temp-low">23&deg;</span></div>
      </div>
      <div class="forecast-item">
        <div class="forecast-day"><div class="forecast-day-name">Sat</div><div class="forecast-date">Aug 30</div></div>
        <span class="forecast-emoji">&#9925;</span>
        <span class="forecast-desc">Partly Cloudy</span>
        <div class="forecast-temps"><span class="temp-high">31&deg;</span><span class="temp-low">24&deg;</span></div>
      </div>
      <div class="forecast-item">
        <div class="forecast-day"><div class="forecast-day-name">Sun</div><div class="forecast-date">Aug 31</div></div>
        <span class="forecast-emoji">&#9728;&#65039;</span>
        <span class="forecast-desc">Sunny</span>
        <div class="forecast-temps"><span class="temp-high">33&deg;</span><span class="temp-low">25&deg;</span></div>
      </div>
      <div class="forecast-item">
        <div class="forecast-day"><div class="forecast-day-name">Mon</div><div class="forecast-date">Sep 1</div></div>
        <span class="forecast-emoji">&#9728;&#65039;</span>
        <span class="forecast-desc">Clear Sky</span>
        <div class="forecast-temps"><span class="temp-high">34&deg;</span><span class="temp-low">25&deg;</span></div>
      </div>
      <div class="forecast-item">
        <div class="forecast-day"><div class="forecast-day-name">Tue</div><div class="forecast-date">Sep 2</div></div>
        <span class="forecast-emoji">&#9925;</span>
        <span class="forecast-desc">Partly Cloudy</span>
        <div class="forecast-temps"><span class="temp-high">32&deg;</span><span class="temp-low">24&deg;</span></div>
      </div>
    </div>
  </div>

  <div class="tab-bar">
    <div class="tab-item"><span class="icon">&#x1F4C5;</span>Today</div>
    <div class="tab-item"><span class="icon">&#9728;&#65039;</span>Solar</div>
    <div class="tab-item active"><span class="icon">&#x1F324;&#65039;</span>Weather</div>
    <div class="tab-item"><span class="icon">&#9881;&#65039;</span>Settings</div>
  </div>
</div>
</body></html>"""

# ── SETTINGS (TABLET 10") ──────────────────────────────────
LOCATIONS = [
    ("Colombo", False),
    ("Kandy", False),
    ("Galle", False),
    ("Jaffna", False),
    ("Negombo", False),
    ("New Delhi", False),
    ("Mumbai", False),
    ("Bangalore", False),
    ("London UK", True),
    ("New York", False),
    ("Tokyo", False),
    ("Sydney", False),
    ("Dubai", False),
    ("Singapore", False),
]
ZODIAC = [
    ("Aries", False), ("Taurus", False), ("Gemini", False),
    ("Cancer", False), ("Leo", True), ("Virgo", False),
    ("Libra", False), ("Scorpio", False), ("Sagittarius", False),
    ("Capricorn", False), ("Aquarius", False), ("Pisces", False),
]

loc_left = ""
loc_right = ""
for i, (name, active) in enumerate(LOCATIONS):
    cls = " active" if active else ""
    item = f'<div class="location-item{cls}">{name}</div>\n'
    if i % 2 == 0:
        loc_left += item
    else:
        loc_right += item

zodiac_html = ""
for name, active in ZODIAC:
    cls = " active" if active else ""
    zodiac_html += f'<div class="zodiac-item{cls}">{name}</div>\n'

SETTINGS_HTML = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>{TABLET10_CSS}</style></head>
<body>
<div class="screen">
  <div class="header"><h1>Settings</h1></div>
  <div class="content">
    <!-- Location two-column -->
    <div class="section">
      <div class="section-title">&#x1F4CD; Location</div>
      <div class="two-col" style="margin-top:0;">
        <div style="flex:1;">{loc_left}</div>
        <div style="flex:1;">{loc_right}</div>
      </div>
    </div>

    <!-- Zodiac -->
    <div class="section">
      <div class="section-title">&#9800; Zodiac Sign</div>
      <div class="zodiac-grid">{zodiac_html}</div>
    </div>

    <!-- Notifications -->
    <div class="section">
      <div class="section-title">&#x1F514; Notifications</div>
      <div class="setting-row">
        <span class="setting-label">Enable Daily Notifications</span>
        <div class="switch"></div>
      </div>
      <div class="setting-row">
        <span class="setting-label">Notification Time</span>
        <div style="background:#1a1a3e;border-radius:14px;padding:14px 28px;font-size:34px;color:#e0e0ff;text-align:center;min-width:190px;">07:00</div>
      </div>
    </div>

    <div class="save-btn">Save Settings</div>
  </div>
  <div class="tab-bar">
    <div class="tab-item"><span class="icon">&#x1F4C5;</span>Today</div>
    <div class="tab-item"><span class="icon">&#9728;&#65039;</span>Solar</div>
    <div class="tab-item"><span class="icon">&#x1F324;&#65039;</span>Weather</div>
    <div class="tab-item active"><span class="icon">&#9881;&#65039;</span>Settings</div>
  </div>
</div>
</body></html>"""

SCREENS = {
    "today": TODAY_HTML,
    "solar": SOLAR_HTML,
    "weather": WEATHER_HTML,
    "settings": SETTINGS_HTML,
}


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for screen_name, html in SCREENS.items():
            page = browser.new_page(viewport={"width": WIDTH, "height": HEIGHT})
            page.set_content(html, wait_until="networkidle")
            time.sleep(0.3)
            path = os.path.join(OUT, f"tablet10_{screen_name}.png")
            page.screenshot(path=path, full_page=False)
            size_kb = os.path.getsize(path) / 1024
            print(f"  {path}  ({size_kb:.0f} KB)")
            page.close()
        browser.close()
    print(f"\nDone -- {len(SCREENS)} tablet screenshots at {WIDTH}x{HEIGHT}")


if __name__ == "__main__":
    main()
