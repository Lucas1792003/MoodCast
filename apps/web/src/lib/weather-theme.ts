export type WeatherTheme =
  | "clear_day"
  | "clear_night"
  | "cloudy_day"
  | "cloudy_night"
  | "rain_day"
  | "rain_night"
  | "storm_day"
  | "storm_night"
  | "snow_day"
  | "snow_night"
  | "fog_day"
  | "fog_night"
  | "heat"

export function themeFromWeather(weatherCode: number, isDay?: boolean): WeatherTheme {
  const day = isDay !== false

  // Snow
  if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) {
    return day ? "snow_day" : "snow_night"
  }

  // Storm
  if (weatherCode >= 95 && weatherCode <= 99) return day ? "storm_day" : "storm_night"

  // Rain / drizzle
  if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return day ? "rain_day" : "rain_night"
  }

  // Fog
  if (weatherCode === 45 || weatherCode === 48) return day ? "fog_day" : "fog_night"

  // Clear vs cloudy
  if (weatherCode === 0) {
    return isDay === false ? "clear_night" : "clear_day"
  }

  // Partly/overcast
  if (weatherCode === 1 || weatherCode === 2 || weatherCode === 3) return day ? "cloudy_day" : "cloudy_night"

  return day ? "cloudy_day" : "cloudy_night"
}

export function themeVars(theme: WeatherTheme) {
  switch (theme) {
    case "clear_day":
      return {
        "--bg-1": "#e0f2fe",
        "--bg-2": "#bae6fd",
        "--bg-3": "#60a5fa",
        "--glow": "rgba(56,189,248,0.35)",
      }

    case "clear_night":
      return {
        "--bg-1": "#020617",
        "--bg-2": "#0a0f2e",
        "--bg-3": "#4c1d95",
        "--glow": "rgba(167,139,250,0.25)",
      }

    case "cloudy_day":
      return {
        "--bg-1": "#e2e8f0",
        "--bg-2": "#cbd5e1",
        "--bg-3": "#64748b",
        "--glow": "rgba(148,163,184,0.28)",
      }

    case "cloudy_night":
      return {
        "--bg-1": "#020617",
        "--bg-2": "#0f172a",
        "--bg-3": "#334155",
        "--glow": "rgba(148,163,184,0.20)",
      }

    case "rain_day":
      return {
        "--bg-1": "#e2e8f0",
        "--bg-2": "#cbd5e1",
        "--bg-3": "#1e40af",
        "--glow": "rgba(59,130,246,0.20)",
      }

    case "rain_night":
      return {
        "--bg-1": "#020617",
        "--bg-2": "#0b1220",
        "--bg-3": "#1e3a8a",
        "--glow": "rgba(59,130,246,0.22)",
      }

    case "storm_day":
      return {
        "--bg-1": "#e0e7ff",
        "--bg-2": "#a5b4fc",
        "--bg-3": "#312e81",
        "--glow": "rgba(99,102,241,0.20)",
      }

    case "storm_night":
      return {
        "--bg-1": "#020617",
        "--bg-2": "#111827",
        "--bg-3": "#312e81",
        "--glow": "rgba(167,139,250,0.22)",
      }

    case "fog_day":
      return {
        "--bg-1": "#f8fafc",
        "--bg-2": "#e2e8f0",
        "--bg-3": "#cbd5e1",
        "--glow": "rgba(226,232,240,0.35)",
      }

    case "fog_night":
      return {
        "--bg-1": "#0b1220",
        "--bg-2": "#111827",
        "--bg-3": "#475569",
        "--glow": "rgba(203,213,225,0.18)",
      }

    case "snow_day":
      return {
        "--bg-1": "#f8fafc",
        "--bg-2": "#e0f2fe",
        "--bg-3": "#93c5fd",
        "--glow": "rgba(186,230,253,0.45)",
      }

    case "snow_night":
      return {
        "--bg-1": "#020617",
        "--bg-2": "#0b1d3a",
        "--bg-3": "#1e40af",
        "--glow": "rgba(186,230,253,0.35)",
      }

    case "heat":
      return {
        "--bg-1": "#fff7ed",
        "--bg-2": "#fdba74",
        "--bg-3": "#fb7185",
        "--glow": "rgba(251,191,36,0.25)",
      }
  }
}
