"""
Take mobile-view screenshots of AstroSet screens using Playwright.
Creates faithful HTML mockups matching the React Native styling and captures
at multiple resolutions.
"""
import os, time
from playwright.sync_api import sync_playwright

OUT = os.path.dirname(os.path.abspath(__file__))

RESOLUTIONS = [
    ("800x480", 800, 480),
    ("1024x600", 1024, 600),
    ("1280x720", 1280, 720),
    ("1280x800", 1280, 800),
    ("1920x1080", 1920, 1080),
    ("1920x1200", 1920, 1200),
    ("2560x1600", 2560, 1600),
]

# Shared CSS for the dark space theme matching the actual app
SHARED_CSS = """
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f0f23;
  color: #e0e0ff;
  min-height: 100vh;
}
.phone-frame {
  max-width: 420px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0f0f23;
}
.header {
  background: #0f0f23;
  padding: 14px 16px;
  border-bottom: 1px solid #3a3a6a;
}
.header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #e0e0ff;
}
.content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}
.live-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px 0;
  gap: 8px;
}
.live-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #10b981;
}
.live-text {
  font-size: 12px;
  color: #10b981;
}
.card {
  background: #252547;
  border-radius: 12px;
  padding: 16px;
  margin: 16px 16px 0;
  border: 1px solid #3a3a6a;
}
.card-title {
  font-size: 12px;
  font-weight: 600;
  color: #a0a0cc;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}
.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #e0e0ff;
  margin-bottom: 8px;
}
.card-sub {
  font-size: 13px;
  color: #a0a0cc;
}
.tab-bar {
  display: flex;
  background: #1a1a3e;
  border-top: 1px solid #3a3a6a;
  justify-content: space-around;
  padding: 8px 0 12px;
  flex-shrink: 0;
}
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #a0a0cc;
}
.tab-item.active {
  color: #4a9eff;
}
.tab-item .icon { font-size: 20px; }

/* Event items */
.event-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #3a3a6a;
}
.event-item:last-child { border-bottom: none; }
.event-icon { font-size: 20px; flex-shrink: 0; }
.event-content { flex: 1; }
.event-title {
  font-size: 13px;
  font-weight: 600;
  color: #e0e0ff;
  margin-bottom: 4px;
}
.event-desc {
  font-size: 12px;
  color: #a0a0cc;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}
.badge-green { background: rgba(46,204,113,0.2); color: #2ecc71; }
.badge-yellow { background: rgba(241,196,15,0.2); color: #f1c40f; }
.badge-red { background: rgba(231,76,60,0.2); color: #e74c3c; }
.badge-orange { background: rgba(230,126,34,0.2); color: #e67e22; }

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
  padding-left: 12px;
}
.summary-label {
  font-size: 11px;
  color: #a0a0cc;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}
.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: #e0e0ff;
  margin-bottom: 4px;
}
.summary-sub {
  font-size: 11px;
  color: #a0a0cc;
}

/* Stats */
.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}
.stat-item { flex: 1; min-width: 45%; }
.stat-label {
  font-size: 12px;
  color: #a0a0cc;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #e0e0ff;
}

/* Meta */
.meta-row {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}
.meta-item {
  font-size: 13px;
  color: #a0a0cc;
}

/* Panchang */
.panchang {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
}
.panchang-item { flex: 1; min-width: 45%; }
.panchang-label {
  font-size: 12px;
  color: #a0a0cc;
  margin-bottom: 4px;
}
.panchang-value {
  font-size: 14px;
  font-weight: 600;
  color: #e0e0ff;
}

/* Graph bars */
.graph-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 120px;
}
.graph-bar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
}
.graph-bar {
  width: 40px;
  border-radius: 4px;
  min-height: 4px;
}
.graph-bar-label {
  font-size: 10px;
  color: #a0a0cc;
  margin-top: 6px;
  text-align: center;
}

/* Weather forecast */
.forecast-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #3a3a6a;
}
.forecast-item:last-child { border-bottom: none; }
.forecast-day { width: 70px; }
.forecast-day-name {
  font-size: 14px;
  font-weight: 600;
  color: #e0e0ff;
}
.forecast-date {
  font-size: 11px;
  color: #a0a0cc;
}
.forecast-emoji { font-size: 24px; margin: 0 12px; }
.forecast-desc { flex: 1; font-size: 13px; color: #a0a0cc; }
.forecast-temps { display: flex; gap: 8px; }
.temp-high { font-size: 14px; font-weight: 600; color: #e74c3c; }
.temp-low { font-size: 14px; color: #a0a0cc; }

/* UV Guide */
.uv-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}
.uv-level { font-size: 14px; font-weight: 600; }
.uv-desc { font-size: 13px; color: #a0a0cc; }

/* Settings */
.section { margin: 24px 16px 0; }
.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #a0a0cc;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}
.location-item {
  background: #252547;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #3a3a6a;
  margin-bottom: 8px;
  font-size: 14px;
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
  gap: 8px;
}
.zodiac-item {
  background: #252547;
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid #3a3a6a;
  font-size: 13px;
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
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}
.setting-label {
  font-size: 14px;
  color: #e0e0ff;
}
.switch {
  width: 48px; height: 28px; border-radius: 14px;
  background: #4a9eff; position: relative;
}
.switch::after {
  content: ''; position: absolute;
  width: 22px; height: 22px; border-radius: 50%;
  background: white; top: 3px; right: 3px;
}
.save-btn {
  background: #4a9eff;
  border-radius: 8px;
  padding: 16px;
  margin: 24px 16px 40px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: white;
}
"""

# ── TODAY SCREEN ──────────────────────────────────────────────
TODAY_HTML = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>{SHARED_CSS}</style></head>
<body>
<div class="phone-frame">
  <div class="header"><h1>Today</h1></div>
  <div class="content">
    <div class="live-bar">
      <div class="live-dot"></div>
      <span class="live-text">Live &bull; Updated 10:32 AM &bull; Next: 29:41</span>
    </div>

    <!-- Planetary Alignment -->
    <div class="card">
      <div class="card-title">&#x1FA90; Planetary Alignment</div>
      <div style="font-size:13px; color:#a0a0cc; line-height:20px;">
        <div style="display:flex;justify-content:space-between;"><span>&#9737; Sun</span><span>Leo 28&deg;14'</span></div>
        <div style="display:flex;justify-content:space-between;"><span>&#9789; Moon</span><span>Aries 15&deg;42'</span></div>
        <div style="display:flex;justify-content:space-between;"><span>&#9794; Mars</span><span>Libra 3&deg;11'</span></div>
        <div style="display:flex;justify-content:space-between;"><span>&#9795; Mercury</span><span>Virgo 12&deg;58'</span></div>
        <div style="display:flex;justify-content:space-between;"><span>&#9792; Venus</span><span>Cancer 21&deg;05'</span></div>
        <div style="display:flex;justify-content:space-between;"><span>&#9795; Jupiter</span><span>Gemini 17&deg;33'</span></div>
        <div style="display:flex;justify-content:space-between;"><span>&#9796; Saturn <span style="color:#f1c40f">&#8470;</span></span><span>Pisces 1&deg;27'</span></div>
        <div style="display:flex;justify-content:space-between;"><span>&#9798; Neptune <span style="color:#f1c40f">&#8470;</span></span><span>Aries 0&deg;52'</span></div>
        <div style="display:flex;justify-content:space-between;"><span>&#9799; Pluto <span style="color:#f1c40f">&#8470;</span></span><span>Aquarius 0&deg;41'</span></div>
      </div>
    </div>

    <!-- Today's Weather -->
    <div class="card">
      <div class="card-title">&#9728;&#65039; Today's Weather</div>
      <div class="card-value">32&deg; / 24&deg;</div>
      <div class="card-sub">Partly cloudy with afternoon showers</div>
      <div class="meta-row">
        <span class="meta-item">&#x1F4A7; 65%</span>
        <span class="meta-item">&#9728;&#65039; UV: 8</span>
        <span class="meta-item">&#x1F4A8; 18 km/h</span>
      </div>
    </div>

    <!-- Moon Phase & Panchang -->
    <div class="card">
      <div class="card-title">&#x1F319; Moon Phase &amp; Vedic Panchang</div>
      <div class="card-value" style="font-size:22px;">&#x1F319; Waning Gibbous</div>
      <div class="card-sub">90% illuminated &bull; Age: 18.4 days</div>
      <div class="panchang">
        <div class="panchang-item"><div class="panchang-label">Tithi</div><div class="panchang-value">Krishna Paksha Chaturdashi</div></div>
        <div class="panchang-item"><div class="panchang-label">Nakshatra</div><div class="panchang-value">Shatabhisha</div></div>
        <div class="panchang-item"><div class="panchang-label">Karana</div><div class="panchang-value">Vishti</div></div>
      </div>
    </div>

    <!-- Upcoming Moon Events -->
    <div class="card">
      <div class="card-title">&#x1F319; Upcoming Moon Events</div>
      <div class="event-item">
        <span class="event-icon">&#x1F311;</span>
        <div class="event-content">
          <div class="event-title">New Moon</div>
          <div class="event-desc">Sat, Aug 23 &bull; 12:06 PM</div>
        </div>
      </div>
      <div class="event-item">
        <span class="event-icon">&#x1F313;</span>
        <div class="event-content">
          <div class="event-title">First Quarter Moon</div>
          <div class="event-desc">Sat, Aug 30 &bull; 8:25 AM</div>
        </div>
      </div>
      <div class="event-item">
        <span class="event-icon">&#x1F315;</span>
        <div class="event-content">
          <div class="event-title">Full Moon</div>
          <div class="event-desc">Sat, Sep 6 &bull; 9:58 PM</div>
        </div>
      </div>
      <div class="event-item">
        <span class="event-icon">&#x1F317;</span>
        <div class="event-content">
          <div class="event-title">Last Quarter Moon</div>
          <div class="event-desc">Sun, Sep 14 &bull; 3:33 AM</div>
        </div>
      </div>
    </div>

    <!-- Upcoming Planetary Events -->
    <div class="card">
      <div class="card-title">&#x1F52D; Upcoming Planetary Events</div>
      <div class="event-item">
        <span class="event-icon">&#9795;</span>
        <div class="event-content">
          <div class="event-title">Mercury enters Libra &#8470;</div>
          <div class="event-desc">Tue, Aug 26 &bull; 4:15 PM</div>
        </div>
      </div>
      <div class="event-item">
        <span class="event-icon">&#9792;</span>
        <div class="event-content">
          <div class="event-title">Venus enters Leo</div>
          <div class="event-desc">Fri, Aug 29 &bull; 11:42 AM</div>
        </div>
      </div>
      <div class="event-item">
        <span class="event-icon">&#9794;</span>
        <div class="event-content">
          <div class="event-title">Mars enters Scorpio</div>
          <div class="event-desc">Mon, Sep 1 &bull; 6:08 PM</div>
        </div>
      </div>
      <div class="event-item">
        <span class="event-icon">&#9795;</span>
        <div class="event-content">
          <div class="event-title">Mercury retrograde begins &#8470;</div>
          <div class="event-desc">Thu, Sep 4 &bull; 2:30 AM</div>
        </div>
      </div>
    </div>

    <!-- Daily Horoscope -->
    <div class="card">
      <div class="card-title">&#9800; Daily Horoscope</div>
      <div style="font-size:16px; font-weight:600; color:#4a9eff; margin-bottom:8px;">Leo</div>
      <div class="card-sub" style="margin-bottom:8px;">For 2026-08-27</div>
      <div style="font-size:14px; line-height:22px; color:#e0e0ff;">
        Today brings a powerful alignment in your communication sector. The cosmos encourages you to express your creative vision with confidence. Financial opportunities may arise through unexpected channels. Trust your intuition when making decisions about partnerships.
      </div>
      <div class="meta-row" style="margin-top:12px;">
        <span class="meta-item">&#x1F3A8; Gold</span>
        <span class="meta-item">&#x1F60A; Confident</span>
      </div>
    </div>

    <!-- Recent Events -->
    <div class="card">
      <div class="card-title">&#x1F4F0; Recent Events</div>
      <div class="event-item">
        <span class="event-icon">&#x26A1;</span>
        <div class="event-content">
          <div class="event-title">SOLAR FLARE</div>
          <div class="event-desc">C6.7 class flare detected from active region AR 3842</div>
        </div>
      </div>
      <div class="event-item">
        <span class="event-icon">&#x1F30A;</span>
        <div class="event-content">
          <div class="event-title">GEOMAGNETIC STORM</div>
          <div class="event-desc">G1 minor storm conditions observed (Kp: 5)</div>
        </div>
      </div>
      <div class="event-item">
        <span class="event-icon">&#x1F30C;</span>
        <div class="event-content">
          <div class="event-title">CORONAL MASS EJECTION</div>
          <div class="event-desc">CME detected; Earth-directed component expected Aug 29</div>
        </div>
      </div>
    </div>

    <div style="height:20px"></div>
  </div>

  <div class="tab-bar">
    <div class="tab-item active"><span class="icon">&#x1F4C5;</span>Today</div>
    <div class="tab-item"><span class="icon">&#9728;&#65039;</span>Solar</div>
    <div class="tab-item"><span class="icon">&#x1F324;&#65039;</span>Weather</div>
    <div class="tab-item"><span class="icon">&#9881;&#65039;</span>Settings</div>
  </div>
</div>
</body></html>"""

# ── SOLAR SCREEN ──────────────────────────────────────────────
SOLAR_HTML = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>{SHARED_CSS}</style></head>
<body>
<div class="phone-frame">
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
          <div class="summary-sub" style="margin-top:4px;">As of Aug 27, 10:00 AM</div>
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

    <!-- Solar Wind -->
    <div class="card">
      <div class="card-title">&#x1F4A8; Solar Wind</div>
      <div class="card-value">363 km/s</div>
      <div class="stats-grid">
        <div class="stat-item"><div class="stat-label">Density</div><div class="stat-value">4.2 p/cm&sup3;</div></div>
        <div class="stat-item"><div class="stat-label">Temperature</div><div class="stat-value">98,400 K</div></div>
        <div class="stat-item"><div class="stat-label">Bz</div><div class="stat-value">3.7 nT</div></div>
      </div>
      <div class="card-sub" style="margin-top:12px;">As of Aug 27, 10:15 AM</div>
    </div>

    <!-- X-Ray Flux -->
    <div class="card">
      <div class="card-title">&#x1F4C8; X-Ray Flux &mdash; Last 7 Days (GOES-18)</div>
      <div style="background:#1a1a35; border-radius:10px; height:190px; position:relative; overflow:hidden; margin-top:4px;">
        <!-- Chart background grid -->
        <svg width="100%" height="100%" viewBox="0 0 340 190" preserveAspectRatio="none">
          <!-- Threshold lines -->
          <line x1="0" y1="38" x2="340" y2="38" stroke="#f1c40f" stroke-width="0.5" stroke-dasharray="4"/>
          <text x="325" y="36" fill="#f1c40f" font-size="8">C</text>
          <line x1="0" y1="19" x2="340" y2="19" stroke="#e67e22" stroke-width="0.5" stroke-dasharray="4"/>
          <text x="325" y="17" fill="#e67e22" font-size="8">M</text>
          <line x1="0" y1="5" x2="340" y2="5" stroke="#e74c3c" stroke-width="0.5" stroke-dasharray="4"/>
          <text x="325" y="5" fill="#e74c3c" font-size="8">X</text>
          <!-- Day gridlines -->
          <line x1="48" y1="0" x2="48" y2="190" stroke="#3a3a6a" stroke-width="0.5"/>
          <line x1="96" y1="0" x2="96" y2="190" stroke="#3a3a6a" stroke-width="0.5"/>
          <line x1="144" y1="0" x2="144" y2="190" stroke="#3a3a6a" stroke-width="0.5"/>
          <line x1="192" y1="0" x2="192" y2="190" stroke="#3a3a6a" stroke-width="0.5"/>
          <line x1="240" y1="0" x2="240" y2="190" stroke="#3a3a6a" stroke-width="0.5"/>
          <line x1="288" y1="0" x2="288" y2="190" stroke="#3a3a6a" stroke-width="0.5"/>
          <!-- Flux line -->
          <defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
          </linearGradient></defs>
          <path d="M0,150 L20,152 L40,148 L60,149 L80,145 L100,147 L120,140 L140,135 L150,110 L155,95 L160,105 L170,130 L180,138 L200,142 L220,140 L240,135 L250,120 L255,115 L260,125 L280,138 L300,140 L320,135 L340,142 L340,190 L0,190Z" fill="url(#areaFill)"/>
          <path d="M0,150 L20,152 L40,148 L60,149 L80,145 L100,147 L120,140 L140,135 L150,110 L155,95 L160,105 L170,130 L180,138 L200,142 L220,140 L240,135 L250,120 L255,115 L260,125 L280,138 L300,140 L320,135 L340,142" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
          <!-- Date labels -->
          <text x="48" y="185" fill="#a0a0cc" font-size="8" text-anchor="middle">Aug 21</text>
          <text x="96" y="185" fill="#a0a0cc" font-size="8" text-anchor="middle">Aug 22</text>
          <text x="144" y="185" fill="#a0a0cc" font-size="8" text-anchor="middle">Aug 23</text>
          <text x="192" y="185" fill="#a0a0cc" font-size="8" text-anchor="middle">Aug 24</text>
          <text x="240" y="185" fill="#a0a0cc" font-size="8" text-anchor="middle">Aug 25</text>
          <text x="288" y="185" fill="#a0a0cc" font-size="8" text-anchor="middle">Aug 26</text>
          <text x="336" y="185" fill="#a0a0cc" font-size="8" text-anchor="middle">Aug 27</text>
        </svg>
      </div>
      <div class="card-sub" style="margin-top:8px;">0.1&ndash;0.8 nm channel, log scale &bull; dashed lines mark flare class thresholds</div>
    </div>

    <!-- Schumann Resonance -->
    <div class="card">
      <div class="card-title">&#x1F30D; Schumann Resonance</div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div class="card-value">42/100</div>
        <span class="badge badge-yellow">Moderate</span>
      </div>
      <div class="card-sub">SR amplitude index 12 &bull; 7.83 Hz fundamental</div>
      <div style="background:#1a1a35; border-radius:10px; height:190px; margin-top:12px; display:flex; align-items:center; justify-content:center;">
        <svg width="100%" height="100%" viewBox="0 0 340 190">
          <rect width="340" height="190" fill="#0a0a18"/>
          <!-- Spectrogram approximation -->
          <rect x="0" y="140" width="340" height="50" fill="#1a0a30" opacity="0.5"/>
          <rect x="0" y="110" width="340" height="30" fill="#2a1050" opacity="0.4"/>
          <rect x="0" y="80" width="340" height="30" fill="#401a60" opacity="0.3"/>
          <rect x="0" y="50" width="340" height="30" fill="#502a40" opacity="0.2"/>
          <rect x="0" y="20" width="340" height="30" fill="#603a20" opacity="0.15"/>
          <!-- Horizontal frequency lines -->
          <line x1="0" y1="152" x2="340" y2="152" stroke="#4a9eff" stroke-width="0.5" opacity="0.4"/>
          <text x="4" y="150" fill="#4a9eff" font-size="7">7.83 Hz</text>
          <line x1="0" y1="115" x2="340" y2="115" stroke="#4a9eff" stroke-width="0.3" opacity="0.3"/>
          <text x="4" y="113" fill="#4a9eff" font-size="7">14.3 Hz</text>
          <!-- Time axis -->
          <text x="10" y="185" fill="#a0a0cc" font-size="7">UTC+7 03:00</text>
          <text x="290" y="185" fill="#a0a0cc" font-size="7">Now</text>
        </svg>
      </div>
      <div class="schumann-summary" style="font-size:13px; color:#a0a0cc; line-height:19px; margin-top:12px;">
        Schumann resonance activity is at moderate levels. The fundamental frequency shows normal oscillation patterns with slight intensification observed in the past few hours.
      </div>
      <div style="font-size:11px; color:#a0a0cc; margin-top:8px;">Tomsk State University SOSRFF (station time UTC+7) &bull; Index: ResonanceOne</div>
    </div>

    <!-- Solar Activity Overview -->
    <div class="card">
      <div class="card-title">&#9728;&#65039; Solar Activity Overview</div>
      <div class="graph-bars">
        <div class="graph-bar-wrap">
          <div class="graph-bar" style="height:18px; background:#10b981;"></div>
          <div class="graph-bar-label">Kp: 2</div>
        </div>
        <div class="graph-bar-wrap">
          <div class="graph-bar" style="height:29px; background:#3b82f6;"></div>
          <div class="graph-bar-label">Wind: 363</div>
        </div>
        <div class="graph-bar-wrap">
          <div class="graph-bar" style="height:7px; background:#8b5cf6;"></div>
          <div class="graph-bar-label">Density: 4.2</div>
        </div>
        <div class="graph-bar-wrap">
          <div class="graph-bar" style="height:12px; background:#ec4899;"></div>
          <div class="graph-bar-label">Aurora: 15%</div>
        </div>
      </div>
    </div>

    <!-- Recent Solar Flares -->
    <div class="card">
      <div class="card-title">&#x26A1; Recent Solar Flares</div>
      <div class="event-item">
        <span class="event-icon" style="color:#f1c40f;">&#x1F7E1;</span>
        <div class="event-content">
          <div class="event-title">C-class Flare</div>
          <div class="event-desc">Source: AR 3842</div>
          <div style="font-size:11px; color:#a0a0cc; margin-top:4px;">Peak: Aug 27, 8:15 AM</div>
        </div>
        <span class="badge badge-yellow">C</span>
      </div>
      <div class="event-item">
        <span class="event-icon" style="color:#f1c40f;">&#x1F7E1;</span>
        <div class="event-content">
          <div class="event-title">C6.7-class Flare</div>
          <div class="event-desc">Source: AR 3839</div>
          <div style="font-size:11px; color:#a0a0cc; margin-top:4px;">Peak: Aug 27, 6:42 AM</div>
        </div>
        <span class="badge badge-yellow">C</span>
      </div>
      <div class="event-item">
        <span class="event-icon" style="color:#e67e22;">&#x1F7E0;</span>
        <div class="event-content">
          <div class="event-title">M1.2-class Flare</div>
          <div class="event-desc">Source: AR 3842</div>
          <div style="font-size:11px; color:#a0a0cc; margin-top:4px;">Peak: Aug 26, 11:30 PM</div>
        </div>
        <span class="badge badge-orange">M</span>
      </div>
    </div>

    <!-- Geomagnetic Storms -->
    <div class="card">
      <div class="card-title">&#x1F30A; Geomagnetic Storms</div>
      <div class="event-item">
        <span class="event-icon">&#x1F30A;</span>
        <div class="event-content">
          <div class="event-title">G1 Storm (Kp: 5)</div>
          <div style="font-size:11px; color:#a0a0cc; margin-top:4px;">Started: Aug 25, 2:00 PM</div>
        </div>
      </div>
      <div class="event-item">
        <span class="event-icon">&#x1F30A;</span>
        <div class="event-content">
          <div class="event-title">G2 Storm (Kp: 6)</div>
          <div style="font-size:11px; color:#a0a0cc; margin-top:4px;">Started: Aug 23, 8:30 PM</div>
        </div>
      </div>
    </div>

    <div style="height:20px"></div>
  </div>

  <div class="tab-bar">
    <div class="tab-item"><span class="icon">&#x1F4C5;</span>Today</div>
    <div class="tab-item active"><span class="icon">&#9728;&#65039;</span>Solar</div>
    <div class="tab-item"><span class="icon">&#x1F324;&#65039;</span>Weather</div>
    <div class="tab-item"><span class="icon">&#9881;&#65039;</span>Settings</div>
  </div>
</div>
</body></html>"""

# ── WEATHER SCREEN ────────────────────────────────────────────
WEATHER_HTML = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>{SHARED_CSS}</style></head>
<body>
<div class="phone-frame">
  <div class="header"><h1>Weather</h1></div>
  <div class="content">
    <!-- Today's Forecast -->
    <div class="card">
      <div class="card-title">&#9728;&#65039; Today's Forecast</div>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
        <span style="font-size:48px;">&#9925;</span>
        <div>
          <div class="card-value">32&deg; / 24&deg;</div>
          <div class="card-sub">Partly cloudy with afternoon showers</div>
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
      <div style="display:flex;gap:24px;margin-top:16px;padding-top:16px;border-top:1px solid #3a3a6a;">
        <span style="font-size:14px;color:#a0a0cc;">&#x1F305; Sunrise: 6:12 AM</span>
        <span style="font-size:14px;color:#a0a0cc;">&#x1F307; Sunset: 6:28 PM</span>
      </div>
    </div>

    <!-- 7-Day Forecast -->
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

    <!-- UV Index Guide -->
    <div class="card">
      <div class="card-title">&#9728;&#65039; UV Index Guide</div>
      <div class="uv-item"><span class="uv-level" style="color:#2ecc71;">0-2 Low</span><span class="uv-desc">No protection needed</span></div>
      <div class="uv-item"><span class="uv-level" style="color:#f1c40f;">3-5 Moderate</span><span class="uv-desc">Wear sunscreen</span></div>
      <div class="uv-item"><span class="uv-level" style="color:#e67e22;">6-7 High</span><span class="uv-desc">Reduce sun exposure</span></div>
      <div class="uv-item"><span class="uv-level" style="color:#e74c3c;">8-10 Very High</span><span class="uv-desc">Extra protection essential</span></div>
      <div class="uv-item"><span class="uv-level" style="color:#9b59b6;">11+ Extreme</span><span class="uv-desc">Avoid sun exposure</span></div>
    </div>

    <div style="height:20px"></div>
  </div>

  <div class="tab-bar">
    <div class="tab-item"><span class="icon">&#x1F4C5;</span>Today</div>
    <div class="tab-item"><span class="icon">&#9728;&#65039;</span>Solar</div>
    <div class="tab-item active"><span class="icon">&#x1F324;&#65039;</span>Weather</div>
    <div class="tab-item"><span class="icon">&#9881;&#65039;</span>Settings</div>
  </div>
</div>
</body></html>"""

# ── SETTINGS SCREEN ───────────────────────────────────────────
LOCATIONS = [
    ("Colombo, Sri Lanka", False),
    ("Kandy, Sri Lanka", False),
    ("Galle, Sri Lanka", False),
    ("Jaffna, Sri Lanka", False),
    ("Negombo, Sri Lanka", False),
    ("New Delhi, India", False),
    ("Mumbai, India", False),
    ("Bangalore, India", False),
    ("London, UK", True),
    ("New York, USA", False),
    ("Tokyo, Japan", False),
    ("Sydney, Australia", False),
    ("Dubai, UAE", False),
    ("Singapore", False),
]
ZODIAC = [
    ("Aries", False), ("Taurus", False), ("Gemini", False),
    ("Cancer", False), ("Leo", True), ("Virgo", False),
    ("Libra", False), ("Scorpio", False), ("Sagittarius", False),
    ("Capricorn", False), ("Aquarius", False), ("Pisces", False),
]
loc_html = ""
for name, active in LOCATIONS:
    cls = " active" if active else ""
    loc_html += f'<div class="location-item{cls}">{name}</div>\n'

zodiac_html = ""
for name, active in ZODIAC:
    cls = " active" if active else ""
    zodiac_html += f'<div class="zodiac-item{cls}">{name}</div>\n'

SETTINGS_HTML = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>{SHARED_CSS}</style></head>
<body>
<div class="phone-frame">
  <div class="header"><h1>Settings</h1></div>
  <div class="content">
    <div class="section">
      <div class="section-title">&#x1F4CD; Location</div>
      {loc_html}
    </div>
    <div class="section">
      <div class="section-title">&#9800; Zodiac Sign</div>
      <div class="zodiac-grid">{zodiac_html}</div>
    </div>
    <div class="section">
      <div class="section-title">&#x1F514; Notifications</div>
      <div class="setting-row">
        <span class="setting-label">Enable Daily Notifications</span>
        <div class="switch"></div>
      </div>
      <div class="setting-row">
        <span class="setting-label">Notification Time</span>
        <div style="background:#1a1a3e;border-radius:6px;padding:6px 12px;font-size:14px;color:#e0e0ff;text-align:center;min-width:80px;">07:00</div>
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
            page = browser.new_page()
            page.set_content(html, wait_until="networkidle")
            time.sleep(0.3)
            for label, w, h in RESOLUTIONS:
                page.set_viewport_size({"width": w, "height": h})
                page.wait_for_timeout(200)
                path = os.path.join(OUT, f"{screen_name}_{w}x{h}.png")
                page.screenshot(path=path, full_page=False)
                print(f"  {path}")
            page.close()
        browser.close()
    print(f"\nDone — {len(SCREENS)} screens x {len(RESOLUTIONS)} resolutions = {len(SCREENS)*len(RESOLUTIONS)} screenshots")

if __name__ == "__main__":
    main()
