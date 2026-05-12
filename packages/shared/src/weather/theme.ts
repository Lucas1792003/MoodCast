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

export type ThemeColors = {
  bg1: string
  bg2: string
  bg3: string
  glow: string
}

export function getThemeColors(theme: WeatherTheme): ThemeColors {
  switch (theme) {
    case "clear_day":
      return {
        bg1: "#e0f2fe",
        bg2: "#bae6fd",
        bg3: "#60a5fa",
        glow: "rgba(56,189,248,0.35)",
      }

    case "clear_night":
      return {
        bg1: "#020617",
        bg2: "#0a0f2e",
        bg3: "#4c1d95",
        glow: "rgba(167,139,250,0.25)",
      }

    case "cloudy_day":
      return {
        bg1: "#e2e8f0",
        bg2: "#cbd5e1",
        bg3: "#64748b",
        glow: "rgba(148,163,184,0.28)",
      }

    case "cloudy_night":
      return {
        bg1: "#020617",
        bg2: "#0f172a",
        bg3: "#334155",
        glow: "rgba(148,163,184,0.20)",
      }

    case "rain_day":
      return {
        bg1: "#e2e8f0",
        bg2: "#cbd5e1",
        bg3: "#1e40af",
        glow: "rgba(59,130,246,0.20)",
      }

    case "rain_night":
      return {
        bg1: "#020617",
        bg2: "#0b1220",
        bg3: "#1e3a8a",
        glow: "rgba(59,130,246,0.22)",
      }

    case "storm_day":
      return {
        bg1: "#e0e7ff",
        bg2: "#a5b4fc",
        bg3: "#312e81",
        glow: "rgba(99,102,241,0.20)",
      }

    case "storm_night":
      return {
        bg1: "#020617",
        bg2: "#111827",
        bg3: "#312e81",
        glow: "rgba(167,139,250,0.22)",
      }

    case "fog_day":
      return {
        bg1: "#f8fafc",
        bg2: "#e2e8f0",
        bg3: "#cbd5e1",
        glow: "rgba(226,232,240,0.35)",
      }

    case "fog_night":
      return {
        bg1: "#0b1220",
        bg2: "#111827",
        bg3: "#475569",
        glow: "rgba(203,213,225,0.18)",
      }

    case "snow_day":
      return {
        bg1: "#f8fafc",
        bg2: "#e0f2fe",
        bg3: "#93c5fd",
        glow: "rgba(186,230,253,0.45)",
      }

    case "snow_night":
      return {
        bg1: "#020617",
        bg2: "#0b1d3a",
        bg3: "#1e40af",
        glow: "rgba(186,230,253,0.35)",
      }

    case "heat":
      return {
        bg1: "#fff7ed",
        bg2: "#fdba74",
        bg3: "#fb7185",
        glow: "rgba(251,191,36,0.25)",
      }
  }
}

// Weather code to icon name mapping (for lucide-react-native)
export function weatherCodeToIcon(code: number, isDay?: boolean): string {
  if (code === 0) return isDay === false ? "Moon" : "Sun"
  if (code <= 3) return isDay === false ? "CloudMoon" : "CloudSun"
  if (code <= 48) return "CloudFog"
  if (code <= 67) return "CloudRain"
  if (code <= 77) return "Snowflake"
  if (code <= 82) return "CloudRain"
  if (code <= 99) return "CloudLightning"
  return "Cloud"
}

// Weather code to human-readable label
export function weatherCodeToLabel(code: number): string {
  if (code === 0) return "Clear"
  if (code <= 3) return "Cloudy"
  if (code <= 48) return "Fog"
  if (code <= 67) return "Rain"
  if (code <= 77) return "Snow"
  if (code <= 82) return "Showers"
  if (code <= 99) return "Storm"
  return "Unknown"
}
