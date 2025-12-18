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
  relative_humidity_2m?: number
  wind_speed_10m?: number
  visibility?: number // meters
  apparent_temperature?: number
  weather_code?: number

  uv_index?: number
  cloud_cover?: number // %
  pressure_msl?: number // hPa
  dew_point_2m?: number

  precipitation_probability?: number // %
  precipitation?: number // mm
  wind_gusts_10m?: number
  wind_direction_10m?: number // degrees (direction wind comes FROM)

  sunrise?: string
  sunset?: string
}

type Tile = {
  label: string
  icon: ReactNode
  value: ReactNode
  hint?: ReactNode
  colSpan?: 1 | 2
  isCustomValue?: boolean
}

function cn(...c: Array<string | null | undefined | false>) {
  return c.filter(Boolean).join(" ")
}

function n(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function formatMaybe(value: number | undefined, fmt: (v: number) => string) {
  return n(value) ? fmt(value) : "—"
}

function degToCompass(deg: number) {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ]
  const i = Math.round((deg % 360) / 22.5) % 16
  return dirs[i]
}

function formatTime(value?: string) {
  if (!value) return "—"
  if (/^\d{2}:\d{2}/.test(value)) return value
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function clampDeg(deg: number) {
  const d = deg % 360
  return d < 0 ? d + 360 : d
}

function oppositeDeg(deg: number) {
  return clampDeg(deg + 180)
}

/**
 * Wind compass that always "fits":
 * - SVG arrows drawn from center outward
 * - center badge blocks the middle so text is clean
 * - dot stays inside the ring
 */
function WindCompassIOS({
  fromDeg,
  speed,
  unit = "km/h",
  className,
}: {
  fromDeg?: number
  speed: string
  unit?: string
  className?: string
}) {
  const has = n(fromDeg)
  const from = has ? clampDeg(fromDeg!) : 0
  const to = has ? oppositeDeg(from) : 0

  return (
    <div className={cn("relative h-full w-full overflow-hidden rounded-full", className)}>
      {/* tick ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "repeating-conic-gradient(from -90deg, hsl(var(--foreground) / 0.22) 0 1deg, transparent 1deg 7deg)",
          opacity: 0.26,
        }}
      />

      {/* rings */}
      <div className="absolute inset-[8%] rounded-full border border-border bg-background/45" />
      <div className="absolute inset-[15%] rounded-full border border-border/60" />

      {/* N/E/S/W */}
      <div className="pointer-events-none absolute inset-0 z-[5] text-[10px] font-semibold text-muted-foreground">
        <span className="absolute left-1/2 top-[6px] -translate-x-1/2">N</span>
        <span className="absolute right-[8px] top-1/2 -translate-y-1/2">E</span>
        <span className="absolute left-1/2 bottom-[6px] -translate-x-1/2">S</span>
        <span className="absolute left-[8px] top-1/2 -translate-y-1/2">W</span>
      </div>

      {/* ARROWS (SVG so it stays visible and fits) */}
      {has && (
        <svg className="absolute inset-0 z-[3]" viewBox="0 0 100 100" aria-hidden>
          {/* TO arrow (thin) */}
          <g transform={`rotate(${to} 50 50)`}>
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="24"
              stroke="hsl(var(--foreground) / 0.45)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <polygon points="50,17 44,27 56,27" fill="hsl(var(--foreground) / 0.45)" />
          </g>

          {/* FROM pointer (thicker) */}
          <g transform={`rotate(${from} 50 50)`}>
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="20"
              stroke="hsl(var(--foreground) / 0.8)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="50" cy="20" r="4.6" fill="hsl(var(--foreground))" />
          </g>
        </svg>
      )}

      {/* center badge (smaller + round) */}
      <div className="absolute inset-0 z-[10] grid place-items-center">
        <div className="grid place-items-center rounded-full bg-background/85 shadow-sm backdrop-blur size-[40%]">
          <div className="text-center leading-none">
            <div className="text-[clamp(14px,2.2vmin,20px)] font-semibold text-foreground tabular-nums">
              {speed}
            </div>
            <div className="mt-1 text-[9px] text-muted-foreground">{unit}</div>
          </div>
        </div>
      </div>


    </div>
  )
}

function WindRowsCompact({
  wind,
  gusts,
  direction,
}: {
  wind: string
  gusts: string
  direction: string
}) {
  const Row = ({
    left,
    right,
    divider,
  }: {
    left: string
    right: string
    divider?: boolean
  }) => (
    <div className={cn("min-w-0", divider && "border-b border-border/70")}>
      <div className="flex items-baseline justify-between gap-3 py-2">
        <div className="text-[15px] font-semibold text-foreground">{left}</div>
        <div className="text-[15px] font-semibold text-muted-foreground tabular-nums">
          {right}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-full flex-col justify-center">
      <Row left="Wind" right={wind} divider />
      <Row left="Gusts" right={gusts} divider />
      <Row left="Direction" right={direction} />
    </div>
  )
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
        icon: <Droplets className="h-4 w-4 text-primary" />,
        value: formatMaybe(weather.relative_humidity_2m, (v) => `${Math.round(v)}%`),
        hint: "Feels more sticky as it rises",
      },
      {
        label: "Visibility",
        icon: <Eye className="h-4 w-4 text-primary" />,
        value: n(weather.visibility) ? `${(weather.visibility / 1000).toFixed(1)} km` : "—",
        hint: "Fog & haze can reduce how far you see",
      },
      {
        label: "Rain chance",
        icon: <CloudRain className="h-4 w-4 text-primary" />,
        value: formatMaybe(weather.precipitation_probability, (v) => `${Math.round(v)}%`),
        hint: "Chance in the next hour",
      },
      {
        label: "Feels like",
        icon: <Gauge className="h-4 w-4 text-primary" />,
        value: formatMaybe(weather.apparent_temperature, (v) => `${Math.round(v)}°`),
        hint: getWeatherDescription(weather.weather_code),
      },
    ]

    const p2: Tile[] = [
      {
        label: "UV Index",
        icon: <Sun className="h-4 w-4 text-primary" />,
        value: formatMaybe(weather.uv_index, (v) => v.toFixed(1)),
        hint: "Higher = faster sunburn",
      },
      {
        label: "Cloud cover",
        icon: <Cloud className="h-4 w-4 text-primary" />,
        value: formatMaybe(weather.cloud_cover, (v) => `${Math.round(v)}%`),
        hint: "More clouds = less direct sun",
      },
      {
        label: "Pressure",
        icon: <Gauge className="h-4 w-4 text-primary" />,
        value: formatMaybe(weather.pressure_msl, (v) => `${Math.round(v)} hPa`),
        hint: "Drops can signal storms",
      },
      {
        label: "Dew point",
        icon: <Thermometer className="h-4 w-4 text-primary" />,
        value: formatMaybe(weather.dew_point_2m, (v) => `${Math.round(v)}°`),
        hint: "Best ‘mugginess’ indicator",
      },
    ]

    const p3: Tile[] = [
      {
        label: "Sunrise",
        icon: <Sunrise className="h-4 w-4 text-primary" />,
        value: formatTime(weather.sunrise),
        hint: "Morning light begins",
      },
      {
        label: "Sunset",
        icon: <Sunset className="h-4 w-4 text-primary" />,
        value: formatTime(weather.sunset),
        hint: "Evening light ends",
      },
      {
        label: "WIND",
        icon: <Wind className="h-4 w-4 text-muted-foreground" />,
        colSpan: 2,
        isCustomValue: true,
        value: (() => {
          const wind = formatMaybe(weather.wind_speed_10m, (v) => `${Math.round(v)} km/h`)
          const gusts = formatMaybe(weather.wind_gusts_10m, (v) => `${Math.round(v)} km/h`)
          const direction = n(weather.wind_direction_10m)
            ? `${Math.round(weather.wind_direction_10m)}° ${degToCompass(weather.wind_direction_10m)}`
            : "—"
          const speedOnly = formatMaybe(weather.wind_speed_10m, (v) => `${Math.round(v)}`)

          return (
            <div className="flex h-full min-h-0 items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <WindRowsCompact wind={wind} gusts={gusts} direction={direction} />
              </div>

              <div className="shrink-0 self-center">
                {/* you can tweak this size if needed */}
                <div className="aspect-square h-[92px] sm:h-[98px]">
                  <WindCompassIOS
                    fromDeg={weather.wind_direction_10m}
                    speed={speedOnly}
                    unit="km/h"
                  />
                </div>
              </div>
            </div>
          )
        })(),
      },
    ]

    const p4: Tile[] = [
      {
        label: "Precip amount",
        icon: <CloudRain className="h-4 w-4 text-primary" />,
        value: formatMaybe(weather.precipitation, (v) => `${v.toFixed(1)} mm`),
        hint: "How much is falling now",
      },
      {
        label: "Cloud cover",
        icon: <Cloud className="h-4 w-4 text-primary" />,
        value: formatMaybe(weather.cloud_cover, (v) => `${Math.round(v)}%`),
        hint: "Sky coverage",
      },
      {
        label: "Wind direction",
        icon: <Compass className="h-4 w-4 text-primary" />,
        value: n(weather.wind_direction_10m)
          ? `${degToCompass(weather.wind_direction_10m)} (${Math.round(weather.wind_direction_10m)}°)`
          : "—",
        hint: "Where the wind comes from",
      },
      {
        label: "Condition",
        icon: <Cloud className="h-4 w-4 text-primary" />,
        value: weather.weather_code != null ? "Now" : "—",
        hint: getWeatherDescription(weather.weather_code),
      },
    ]

    return [p1, p2, p3, p4]
  }, [weather, getWeatherDescription])

  const current = pages[page] ?? pages[0]

  return (
    <div className="relative self-stretch">
      <div className="grid h-[clamp(260px,32vh,340px)] grid-cols-2 grid-rows-2 gap-3">
        {current.map((t) => (
          <div
            key={t.label}
            className={cn(
              "flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card/90 p-3 backdrop-blur",
              t.colSpan === 2 && "col-span-2"
            )}
          >
            <div className="flex items-center gap-2">
              {t.icon}
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">
                {t.label}
              </p>
            </div>

            <div className="mt-2 min-h-0 flex-1">
              {t.isCustomValue ? (
                <div className="h-full min-h-0">{t.value}</div>
              ) : (
                <p className="text-[clamp(20px,3.1vh,32px)] font-semibold leading-none text-foreground">
                  {t.value}
                </p>
              )}
            </div>

            {t.hint ? (
              <div className="text-xs leading-snug text-muted-foreground line-clamp-2">
                {t.hint}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Cycle weather info"
        onClick={() => setPage((p) => (p + 1) % pages.length)}
        className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/90 shadow-md backdrop-blur transition active:scale-95"
      >
        <RefreshCw className="h-5 w-5 text-foreground" />
      </button>
    </div>
  )
}
