"use client"

import {
  Clock,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
} from "lucide-react"

type HourlyForecastItem = {
  time: string
  temperature: number
  condition?: string
}

type Props = {
  data?: HourlyForecastItem[]
  hourly?: HourlyForecastItem[]
}

function iconFor(condition?: string) {
  const c = (condition ?? "").toLowerCase()
  if (c.includes("storm") || c.includes("thunder")) return CloudLightning
  if (c.includes("snow") || c.includes("sleet")) return CloudSnow
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower"))
    return CloudRain
  if (c.includes("wind")) return Wind
  if (c.includes("clear") || c.includes("sun")) return Sun
  return Cloud
}

function tintFor(condition?: string) {
  const c = (condition ?? "").toLowerCase()
  if (c.includes("storm") || c.includes("thunder")) return "text-violet-700"
  if (c.includes("snow") || c.includes("sleet")) return "text-sky-700"
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower"))
    return "text-blue-700"
  if (c.includes("wind")) return "text-teal-700"
  if (c.includes("clear") || c.includes("sun")) return "text-amber-700"
  return "text-slate-600"
}

function chipBgFor(condition?: string) {
  const c = (condition ?? "").toLowerCase()
  if (c.includes("storm") || c.includes("thunder")) return "bg-violet-50"
  if (c.includes("snow") || c.includes("sleet")) return "bg-sky-50"
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower"))
    return "bg-blue-50"
  if (c.includes("wind")) return "bg-teal-50"
  if (c.includes("clear") || c.includes("sun")) return "bg-amber-50"
  return "bg-slate-50"
}

// Convert Fahrenheit to Celsius
function fToC(f: number): number {
  return ((f - 32) * 5) / 9
}

export default function HourlyForecastCard({ data, hourly }: Props) {
  const items = hourly ?? data ?? []
  const hasData = items.length > 0

  // Format time label - show "Now" for first item
  const formatTimeLabel = (time: string, index: number): string => {
    if (index === 0) return "Now"
    return time
  }

  return (
    <section className="w-full rounded-3xl bg-white border border-slate-200 p-4 sm:p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} className="text-slate-600" />
        <h2 className="text-lg font-semibold tracking-tight">Hourly Forecast</h2>
      </div>

      {!hasData ? (
        <p className="text-sm text-slate-500">No hourly forecast available</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-2 sm:gap-3 pb-2 pr-4">
            {items.slice(0, 24).map((hour, i) => {
              const Icon = iconFor(hour.condition)
              const tint = tintFor(hour.condition)
              const chipBg = chipBgFor(hour.condition)

              return (
                <div
                  key={i}
                  className={[
                    "flex min-w-[62px] sm:min-w-[72px] flex-col items-center justify-between",
                    "rounded-2xl border border-slate-200 bg-white",
                    "px-2 py-2.5 sm:px-2.5 sm:py-3",
                    "transition-colors hover:border-slate-300",
                  ].join(" ")}
                >
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    {formatTimeLabel(hour.time, i)}
                  </span>

                  <div
                    className={[
                      "mt-2 mb-1 rounded-xl p-2",
                      chipBg,
                      "border border-slate-200/60",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    <Icon className={["h-5 w-5", tint].join(" ")} />
                  </div>

                  <span className="text-base sm:text-lg font-semibold text-slate-900 leading-none">
                    {Math.round(fToC(hour.temperature))}°C
                  </span>

                  {hour.condition ? (
                    <span className="mt-1 text-[10px] sm:text-xs text-slate-500 truncate max-w-full">
                      {hour.condition}
                    </span>
                  ) : (
                    <span className="mt-1 text-[10px] sm:text-xs text-slate-400">—</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
