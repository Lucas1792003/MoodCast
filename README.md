# MoodCast

Your weather-powered lifestyle companion. See the weather, get outfit ideas, discover nearby activities, and match your mood — all in one place.

**Live:** https://lucas1792003.github.io/MoodCast

---

## Features

- **Weather** — Current conditions, hourly & 7-day forecast, UV index, wind, humidity
- **Outfits** — Weather and location-aware outfit suggestions
- **Activities** — Nearby places (cafes, parks, malls, etc.) based on weather and time of day
- **Mood** — Weather-matched mood suggestions
- **Health** — Heat index, comfort level, and wellness tips
- **AR Sky** — Augmented reality sky viewer

All APIs are public and free — no API keys required.

---

## Tech Stack

- **Framework:** Next.js 16 (static export)
- **Styling:** Tailwind CSS + shadcn/ui
- **Maps:** MapLibre GL
- **Animations:** Framer Motion
- **Weather:** Open-Meteo (free, no key needed)
- **Geocoding:** Open-Meteo Geocoding + Nominatim
- **Places:** Overpass API (OpenStreetMap)
- **Hosting:** GitHub Pages

---

## Project Structure

```
MoodCast/
├── .github/
│   └── workflows/
│       └── deploy.yml       # Auto-deploy to GitHub Pages on push to main
├── apps/
│   ├── web/                 # Next.js web app
│   │   ├── public/
│   │   │   └── datasets/
│   │   │       └── outfits-latest.json   # Static outfit dataset
│   │   └── src/
│   │       ├── app/         # Next.js App Router pages
│   │       ├── components/  # UI components
│   │       └── lib/         # Utilities and API clients
│   └── mobile/              # React Native (Expo) — work in progress
└── packages/
    └── shared/              # Shared types and utilities
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Start the web app
npm run web
```

Open **http://localhost:3000**

---

## Deploying to GitHub Pages

Deployments are automatic — push to `main` and GitHub Actions builds and deploys the site.

To set up from scratch:

1. Create a GitHub repo named `MoodCast`
2. Push the code to `main`
3. Go to **Settings → Pages → Source → GitHub Actions**

That's it. No secrets or environment variables needed.

---

## Building Locally

```bash
npm run build:web
```

Output goes to `apps/web/out/`.

---

## License

MIT
