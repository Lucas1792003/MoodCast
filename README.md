# MoodCast 🌤️🌙

MoodCast is a clean, animated weather web app built with **Next.js (App Router)** + **Tailwind CSS**.  
It pulls real-time weather from an API and updates the UI to match real-world conditions (day/night, weather icons, and animated backgrounds).

---

## Features

- **Real-time weather** by searched location
- **Day/Night UI switching** (based on API `is_day`)
- **Weather condition icons** (Lucide React)
- **Animated card background** using short MP4 loops:
  - Day card → `public/day.mp4`
  - Night card → `public/night.mp4`
- Clean bright daytime UI, darker night UI

---

## Tech Stack

- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (icons)

---

## Getting Started

### 1) Install dependencies

```bash
npm install
2) Add your background videos
Place your videos in the public/ folder:

arduino
Copy code
public/day.mp4
public/night.mp4
Tip: Keep them short (2–6 seconds), loop-friendly, and ideally under ~3–8 MB for fast loading.

3) Run the dev server
bash
Copy code
npm run dev
Open:

arduino
Copy code
http://localhost:3000
How Day/Night Works
The app uses the weather API response field:

is_day: 1 → day

is_day: 0 → night

The page background uses weather.isDay (boolean).
The card uses weather.is_day (number) passed into the component.

✅ Make sure the data you pass into WeatherCard includes is_day, for example:

ts
Copy code
const weatherForComponents = {
  temperature_2m: weather.temperature,
  weather_code: weather.weatherCode,
  is_day: weather.isDay ? 1 : 0,
}
Project Structure (typical)
csharp
Copy code
src/
  app/
    api/
      weather/
        route.ts        # Weather API endpoint
    page.tsx            # Main UI
  components/
    WeatherCard.tsx     # Weather card (MP4 day/night background)
public/
  day.mp4
  night.mp4
Your exact names may differ slightly, but this is the general layout.

WeatherCard MP4 Background
The weather card renders a looping MP4 (no Next.js image compression):

tsx
Copy code
<video
  className="absolute inset-0 h-full w-full object-cover"
  src={isDay ? "/day.mp4" : "/night.mp4"}
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
/>
Troubleshooting
Card shows day when it should be night
That means weather.is_day is missing in the data passed to WeatherCard.
Fix: pass is_day from the API result (see above).

Video not showing
Confirm files exist:

public/day.mp4

public/night.mp4

Restart the dev server after adding files:

bash
Copy code
npm run dev
Check the browser console for 404 errors.

Video looks stretched
Try using a video with an aspect ratio closer to your card size (e.g., 16:9), and keep:

css
Copy code
object-cover
Scripts
bash
Copy code
npm run dev       # Start dev server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Lint
