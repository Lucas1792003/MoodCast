# MoodCast ☁️✨
**Weather-powered outfits & vibes.**  
MoodCast turns real-time weather into a clean, animated interface with **mood tips**, **outfit ideas**, and **what to do nearby**—all styled to match the sky outside.

> Built for “open the app → instantly feel the day.”

---

## What it does
MoodCast pulls current conditions for your location (or any city you search) and translates them into:
- a **weather card** (day/night aware),
- a **dynamic theme layer** (rain, snow, fog, clouds, heat shimmer, sun rays, sun/moon),
- a **4-card metrics grid** you can cycle through (humidity → UV → pressure → sunrise, etc.),
- plus **mood**, **outfit**, **activity**, and **health** suggestions based on conditions.

---

## Features
### Real-time weather, instantly readable
- Current temperature + “feels like”
- Wind, humidity, visibility
- Sunrise/sunset
- Extra metrics (UV, pressure, dew point, precip chance/amount, gusts, wind direction) via the cycle grid

### UI that matches the sky
- **SnowCanvas** (icon snowflakes + particles)
- **Rain overlay**
- **Fog overlay**
- **Cloud overlay** (light/dark variants)
- **Heatwave shimmer**
- **Sun rays** (clear day)
- **Celestial overlay** (sun/moon)
- Effects render through a portal for better mobile reliability

### Smart location labeling
When you load via GPS, MoodCast tries to show a human-friendly name:
- Reverse geocoding via **OpenStreetMap Nominatim**
- If the label looks weak, it falls back to a nearby POI name using **Overpass API**

### Mobile-first
- Fixed header layout designed for iPhone/iPad space constraints
- Uses `visualViewport` where needed for viewport-safe rendering

---

## Demo
Add your screenshots/gifs here:

- `docs/screenshot-1.png`
- `docs/screenshot-2.png`
- `docs/mobile.gif`

```md
![MoodCast](docs/screenshot-1.png)
Tech stack
Next.js (App Router)

TypeScript

Tailwind CSS

lucide-react icons

Data: Open-Meteo (no API key required), OpenStreetMap (Nominatim + Overpass)

Getting started
1) Install
bash
Copy code
git clone https://github.com/Lucas1792003/MoodCast.git
cd MoodCast
npm install
2) Run locally
bash
Copy code
npm run dev
Open http://localhost:3000

3) Build / start
bash
Copy code
npm run build
npm run start
✅ No API keys required by default.

How it works
Core flow
Header search

City search → /api/geocode → lat/lon → /api/weather

“Current” button → browser geolocation → /api/weather?lat=...&lon=...

WeatherThemeLayer

Converts weather code + day/night + feels-like into a theme

Applies CSS variables

Renders weather effects in a portal (so they stay stable over the UI)

Info-grid cycler

Shows 4 tiles at a time

Center button cycles through pages of metrics

API routes
Your app typically includes routes like:

GET /api/weather?lat=..&lon=..&name=..
Returns current weather + extras + sunrise/sunset.

GET /api/geocode?q=...
Converts a city name into coordinates.

GET /api/reverse-city?lat=..&lon=.. (optional)
Friendly label for the input pill.

Customization
Weather effects
Open:

src/components/weather-effects/*

src/components/weather-theme-layer.tsx

Tweak:

snow density / intensity

wind push

fog opacity and speed

cloud variant selection

heat shimmer strength

Metrics pages
Open:

src/components/weather-info-grid-cycler.tsx

Add/modify tile pages (p1, p2, p3, p4) to control what the user cycles through.

Contributing
PRs are welcome. Good areas to contribute:

better activity suggestions

new effect styles (lightning, drizzle, haze)

improved weather-code mapping

performance improvements on low-power mobile devices

Credits
Weather data: Open-Meteo

Geocoding & POIs: OpenStreetMap (Nominatim, Overpass)

Icons: Lucide

License
Add your license here (MIT recommended):

md
Copy code
MIT License © 2025 Lucas
makefile
Copy code
::contentReference[oaicite:0]{index=0}