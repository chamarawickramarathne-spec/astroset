"""
Generate Google Play Store feature graphic for AstroSet.
1024x500 px, PNG, no alpha.
"""
import os
import time
from playwright.sync_api import sync_playwright

OUT = os.path.dirname(os.path.abspath(__file__))

HTML = """<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1024px;
  height: 500px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #0a0a1a 0%, #0f0f23 30%, #1a1040 60%, #0f0f23 100%);
  color: #e0e0ff;
  position: relative;
}

/* Star field */
.star {
  position: absolute;
  border-radius: 50%;
  background: white;
}

/* Zodiac wheel */
.zodiac-ring {
  position: absolute;
  left: 80px;
  top: 50%;
  transform: translateY(-50%);
  width: 340px;
  height: 340px;
  border-radius: 50%;
  border: 2px solid rgba(74, 158, 255, 0.3);
}
.zodiac-ring-inner {
  position: absolute;
  left: 115px;
  top: 50%;
  transform: translateY(-50%);
  width: 270px;
  height: 270px;
  border-radius: 50%;
  border: 1px solid rgba(74, 158, 255, 0.15);
}

/* Planet dots on the ring */
.planet-dot {
  position: absolute;
  border-radius: 50%;
  z-index: 2;
}

/* Right side content */
.right-content {
  position: absolute;
  right: 60px;
  top: 50%;
  transform: translateY(-50%);
  text-align: right;
  max-width: 520px;
}
.app-name {
  font-size: 72px;
  font-weight: 800;
  letter-spacing: -1px;
  background: linear-gradient(135deg, #4a9eff 0%, #a78bfa 50%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  line-height: 1;
}
.tagline {
  font-size: 24px;
  color: #a0a0cc;
  font-weight: 400;
  margin-bottom: 28px;
  line-height: 1.3;
}
.features {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}
.feature-chip {
  background: rgba(74, 158, 255, 0.12);
  border: 1px solid rgba(74, 158, 255, 0.25);
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 15px;
  color: #c0c0ee;
  white-space: nowrap;
}

/* Glow effects */
.glow-purple {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
  left: 30px;
  top: 50%;
  transform: translateY(-50%);
}
.glow-blue {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(74, 158, 255, 0.08) 0%, transparent 70%);
  right: 100px;
  top: 50%;
  transform: translateY(-50%);
}

/* Crescent moon */
.moon {
  position: absolute;
  left: 220px;
  top: 60px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 12px -4px 0 0 #e0e0ff;
}

/* Small decorative rings */
.deco-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(74, 158, 255, 0.1);
}
</style>
</head>
<body>

<!-- Background glows -->
<div class="glow-purple"></div>
<div class="glow-blue"></div>

<!-- Star field -->
<div class="star" style="left:50px;top:40px;width:2px;height:2px;opacity:0.6"></div>
<div class="star" style="left:120px;top:80px;width:3px;height:3px;opacity:0.4"></div>
<div class="star" style="left:200px;top:30px;width:2px;height:2px;opacity:0.7"></div>
<div class="star" style="left:350px;top:50px;width:2px;height:2px;opacity:0.5"></div>
<div class="star" style="left:450px;top:90px;width:3px;height:3px;opacity:0.3"></div>
<div class="star" style="left:550px;top:40px;width:2px;height:2px;opacity:0.6"></div>
<div class="star" style="left:650px;top:70px;width:2px;height:2px;opacity:0.4"></div>
<div class="star" style="left:750px;top:30px;width:3px;height:3px;opacity:0.5"></div>
<div class="star" style="left:850px;top:80px;width:2px;height:2px;opacity:0.7"></div>
<div class="star" style="left:950px;top:50px;width:2px;height:2px;opacity:0.4"></div>
<div class="star" style="left:100px;top:420px;width:2px;height:2px;opacity:0.5"></div>
<div class="star" style="left:300px;top:450px;width:3px;height:3px;opacity:0.3"></div>
<div class="star" style="left:500px;top:430px;width:2px;height:2px;opacity:0.6"></div>
<div class="star" style="left:700px;top:460px;width:2px;height:2px;opacity:0.4"></div>
<div class="star" style="left:900px;top:440px;width:3px;height:3px;opacity:0.5"></div>
<div class="star" style="left:160px;top:200px;width:2px;height:2px;opacity:0.3"></div>
<div class="star" style="left:400px;top:150px;width:2px;height:2px;opacity:0.4"></div>
<div class="star" style="left:600px;top:250px;width:3px;height:3px;opacity:0.3"></div>
<div class="star" style="left:800px;top:180px;width:2px;height:2px;opacity:0.5"></div>
<div class="star" style="left:980px;top:300px;width:2px;height:2px;opacity:0.4"></div>

<!-- Decorative rings -->
<div class="deco-ring" style="left:500px;top:-50px;width:200px;height:200px;"></div>
<div class="deco-ring" style="left:-30px;top:350px;width:150px;height:150px;"></div>

<!-- Zodiac wheel -->
<div class="zodiac-ring"></div>
<div class="zodiac-ring-inner"></div>

<!-- Zodiac symbols around the ring (centered at 250, 250 with radius 155) -->
<svg style="position:absolute;left:80px;top:50%;transform:translateY(-50%);width:340px;height:340px;" viewBox="0 0 340 340">
  <!-- Ring strokes -->
  <circle cx="170" cy="170" r="155" fill="none" stroke="rgba(74,158,255,0.25)" stroke-width="1.5"/>
  <circle cx="170" cy="170" r="120" fill="none" stroke="rgba(74,158,255,0.12)" stroke-width="1"/>
  <circle cx="170" cy="170" r="85" fill="none" stroke="rgba(139,92,246,0.1)" stroke-width="0.5"/>

  <!-- Zodiac glyphs around the outer ring -->
  <text x="170" y="28" fill="#a0a0cc" font-size="16" text-anchor="middle" font-family="serif">&#9800;</text>
  <text x="243" y="42" fill="#a0a0cc" font-size="16" text-anchor="middle" font-family="serif">&#9801;</text>
  <text x="295" y="95" fill="#a0a0cc" font-size="16" text-anchor="middle" font-family="serif">&#9802;</text>
  <text x="318" y="170" fill="#a0a0cc" font-size="16" text-anchor="middle" font-family="serif">&#9803;</text>
  <text x="295" y="248" fill="#a0a0cc" font-size="16" text-anchor="middle" font-family="serif">&#9804;</text>
  <text x="243" y="300" fill="#a0a0cc" font-size="16" text-anchor="middle" font-family="serif">&#9805;</text>
  <text x="170" y="322" fill="#a0a0cc" font-size="16" text-anchor="middle" font-family="serif">&#9806;</text>
  <text x="97" y="300" fill="#a0a0cc" font-size="16" text-anchor="middle" font-family="serif">&#9807;</text>
  <text x="45" y="248" fill="#a0a0cc" font-size="16" text-anchor="middle" font-family="serif">&#9808;</text>
  <text x="22" y="170" fill="#a0a0cc" font-size="16" text-anchor="middle" font-family="serif">&#9809;</text>
  <text x="45" y="95" fill="#a0a0cc" font-size="16" text-anchor="middle" font-family="serif">&#9810;</text>
  <text x="97" y="42" fill="#a0a0cc" font-size="16" text-anchor="middle" font-family="serif">&#9811;</text>

  <!-- Planet dots on the ring -->
  <!-- Sun at Leo (position ~4 on clock) -->
  <circle cx="295" cy="95" r="7" fill="#f59e0b" opacity="0.9"/>
  <circle cx="295" cy="95" r="11" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.3"/>
  <!-- Moon at Aries (position ~11 on clock) -->
  <circle cx="97" cy="42" r="5" fill="#e0e0ff" opacity="0.8"/>
  <!-- Mars at Libra (position ~5 on clock) -->
  <circle cx="318" cy="170" r="5" fill="#ef4444" opacity="0.8"/>
  <!-- Venus at Cancer (position ~3 on clock) -->
  <circle cx="243" cy="42" r="5" fill="#f472b6" opacity="0.8"/>
  <!-- Jupiter at Gemini (position ~1 on clock) -->
  <circle cx="170" cy="28" r="6" fill="#8b5cf6" opacity="0.8"/>
  <!-- Saturn at Pisces (retrograde, position ~7 on clock) -->
  <circle cx="45" cy="248" r="5" fill="#a78bfa" opacity="0.8"/>
  <text x="45" y="262" fill="#f1c40f" font-size="10" text-anchor="middle">&#8470;</text>
</svg>

<!-- Moon crescent -->
<div class="moon"></div>

<!-- Right side content -->
<div class="right-content">
  <div class="app-name">AstroSet</div>
  <div class="tagline">Your Daily Guide to the Cosmos</div>
  <div class="features">
    <div class="feature-chip">&#x1FA90; Planetary Positions</div>
    <div class="feature-chip">&#x1F319; Moon Events</div>
    <div class="feature-chip">&#x26A1; Solar Flares</div>
    <div class="feature-chip">&#x1F30D; Schumann Resonance</div>
    <div class="feature-chip">&#x1F324;&#65039; Weather &amp; UV</div>
    <div class="feature-chip">&#9800; Vedic Panchang</div>
    <div class="feature-chip">&#x1F52D; Retrograde Alerts</div>
    <div class="feature-chip">&#x1F30C; Aurora Forecast</div>
  </div>
</div>

</body>
</html>"""


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1024, "height": 500})
        page.set_content(HTML, wait_until="networkidle")
        time.sleep(0.3)
        path = os.path.join(OUT, "feature_graphic.png")
        page.screenshot(path=path, full_page=False)
        size_kb = os.path.getsize(path) / 1024
        print(f"  {path}  ({size_kb:.0f} KB)")
        page.close()
        browser.close()
    print(f"\nDone -- feature graphic at 1024x500")


if __name__ == "__main__":
    main()
