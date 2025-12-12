"use client"

import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import {
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sun,
  Cloud,
  Thermometer,
  CloudRain,
  Compass,
  Sunrise,
  Sunset,
  RefreshCw,
} from "lucide-react"

type WeatherForComponents = {
  // your current ones
  relative_humidity_2m?: number
  wind_speed_10m?: number
  visibility?: number // meters
  apparent_temperature?: number
  weather_code?: number

  // nice extras (optional — show "—" if missing)
  uv_index?: number
  cloud_cover?: number // %
  pressure_msl?: number // hPa
  dew_point_2m?: number

  precipitation_probability?: number // %
  precipitation?: number // mm
  wind_gusts_10m?: number // mph
  wind_direction_10m?: number // degrees

  sunrise?: string // ISO string or "HH:MM" depending on your API mapping
  sunset?: string
}

type Tile = {
  label: string
  icon: ReactNode
  value: string
  hint: string
}

function n(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function formatMaybe(value: number | undefined, fmt: (v: number) => string) {
  return n(value) ? fmt(value) : "—"
}

function degToCompass(deg: number) {
  // 16-wind compass
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
  const i = Math.round((deg % 360) / 22.5) % 16
  return dirs[i]
}

function formatTime(value?: string) {
  if (!value) return "—"
  // If it's ISO, parse. If it's already "HH:MM", just return it.
  if (/^\d{2}:\d{2}/.test(value)) return value
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function WeatherInfoGridCycler({
  weather,
  getWeatherDescription,
}: {
  weather: WeatherForComponents
  getWeatherDescription: (code?: number) => string
}) {
  const [page, setPage] = useState(0)

  const pages = useMemo<Tile[][]>(() => {
    const p1: Tile[] = [
      {
        label: "Humidity",
        icon: <Droplets className="w-4 h-4 text-primary" />,
        value: formatMaybe(weather.relative_humidity_2m, (v) => `${Math.round(v)}%`),
        hint: "Feels more sticky as it rises",
      },
      {
        label: "Wind",
        icon: <Wind className="w-4 h-4 text-primary" />,
        value: formatMaybe(weather.wind_speed_10m, (v) => `${Math.round(v)} mph`),
        hint: "Stronger winds = extra chill",
      },
      {
        label: "Visibility",
        icon: <Eye className="w-4 h-4 text-primary" />,
        value: n(weather.visibility) ? `${(weather.visibility / 1000).toFixed(1)} km` : "—",
        hint: "Fog & haze can reduce how far you see",
      },
      {
        label: "Rain chance",
        icon: <CloudRain className="w-4 h-4 text-primary" />,
        value: formatMaybe(weather.precipitation_probability, (v) => `${Math.round(v)}%`),
        hint: "Chance in the next hour",
      },
      
    ]

    const p2: Tile[] = [
      {
        label: "UV Index",
        icon: <Sun className="w-4 h-4 text-primary" />,
        value: formatMaybe(weather.uv_index, (v) => v.toFixed(1)),
        hint: "Higher = faster sunburn",
      },
      {
        label: "Cloud cover",
        icon: <Cloud className="w-4 h-4 text-primary" />,
        value: formatMaybe(weather.cloud_cover, (v) => `${Math.round(v)}%`),
        hint: "More clouds = less direct sun",
      },
      {
        label: "Pressure",
        icon: <Gauge className="w-4 h-4 text-primary" />,
        value: formatMaybe(weather.pressure_msl, (v) => `${Math.round(v)} hPa`),
        hint: "Drops can signal storms",
      },
      {
        label: "Dew point",
        icon: <Thermometer className="w-4 h-4 text-primary" />,
        value: formatMaybe(weather.dew_point_2m, (v) => `${Math.round(v)}°`),
        hint: "Best ‘mugginess’ indicator",
      },
    ]

    const p3: Tile[] = [
      {
        label: "Wind direction",
        icon: <Compass className="w-4 h-4 text-primary" />,
        value: n(weather.wind_direction_10m)
          ? `${degToCompass(weather.wind_direction_10m)} (${Math.round(weather.wind_direction_10m)}°)`
          : "—",
        hint: "Where the wind comes from",
      },
      {
        label: "Precip amount",
        icon: <CloudRain className="w-4 h-4 text-primary" />,
        value: formatMaybe(weather.precipitation, (v) => `${v.toFixed(1)} mm`),
        hint: "How much is falling now",
      },
      {
        label: "Wind gusts",
        icon: <Wind className="w-4 h-4 text-primary" />,
        value: formatMaybe(weather.wind_gusts_10m, (v) => `${Math.round(v)} mph`),
        hint: "Sudden stronger bursts",
      },
      {
        label: "Feels like",
        icon: <Gauge className="w-4 h-4 text-primary" />,
        value: formatMaybe(weather.apparent_temperature, (v) => `${Math.round(v)}°`),
        hint: getWeatherDescription(weather.weather_code),
      },
      
    ]

    const p4: Tile[] = [
      {
        label: "Sunrise",
        icon: <Sunrise className="w-4 h-4 text-primary" />,
        value: formatTime(weather.sunrise),
        hint: "Morning light begins",
      },
      {
        label: "Sunset",
        icon: <Sunset className="w-4 h-4 text-primary" />,
        value: formatTime(weather.sunset),
        hint: "Evening light ends",
      },
      {
        label: "Day length",
        icon: <Sun className="w-4 h-4 text-primary" />,
        value:
          weather.sunrise &&
          weather.sunset &&
          !/^\d{2}:\d{2}/.test(weather.sunrise) &&
          !/^\d{2}:\d{2}/.test(weather.sunset)
            ? (() => {
                const sr = new Date(weather.sunrise).getTime()
                const ss = new Date(weather.sunset).getTime()
                if (!Number.isFinite(sr) || !Number.isFinite(ss) || ss <= sr) return "—"
                const mins = Math.round((ss - sr) / 60000)
                const h = Math.floor(mins / 60)
                const m = mins % 60
                return `${h}h ${m}m`
              })()
            : "—",
        hint: "Useful for planning",
      },
      {
        label: "Condition",
        icon: <Cloud className="w-4 h-4 text-primary" />,
        value: weather.weather_code != null ? "Now" : "—",
        hint: getWeatherDescription(weather.weather_code),
      },
    ]

    return [p1, p2, p3, p4]
  }, [weather, getWeatherDescription])

    const current = pages[page] ?? pages[0]

  return (
    <div className="relative h-full self-stretch">
      <div className="grid h-full grid-cols-2 grid-rows-2 gap-3">
        {current.map((t) => (
          <div
            key={t.label}
            className="
              bg-card/90 backdrop-blur rounded-lg p-4 border border-border
              h-full
              flex flex-col
            "
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                {t.icon}
                <p className="text-xs font-medium text-muted-foreground">{t.label}</p>
              </div>

              <p className="text-2xl font-semibold text-foreground leading-none">{t.value}</p>
            </div>

            <p className="text-xs text-muted-foreground mt-auto leading-snug line-clamp-2">{t.hint}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Cycle weather info"
        onClick={() => setPage((p) => (p + 1) % pages.length)}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   w-12 h-12 rounded-full border border-border bg-background/90 backdrop-blur
                   shadow-md grid place-items-center active:scale-95 transition"
      >
        <RefreshCw className="w-5 h-5 text-foreground" />
      </button>
    </div>
  )


}
