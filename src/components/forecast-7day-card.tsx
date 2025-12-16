"use client"

import {
  CalendarDays,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
} from "lucide-react"

type DailyForecastItem = {
  day: string
  min: number
  max: number
  condition?: string
}

type Props = {
  data?: DailyForecastItem[]
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

// Convert Fahrenheit to Celsius
function fToC(f: number): number {
  return ((f - 32) * 5) / 9
}

function normalizeWeekStart<T extends { day: string }>(data: T[]): (T & { displayDay: string })[] {
  const weekDaysShort = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
  const todayShort = weekDaysShort[new Date().getDay()]

  const normalize = (s: string) => s.trim().slice(0, 3).toLowerCase()

  const todayLabelIndex = data.findIndex(
    (d) => d.day.trim().toLowerCase() === "today"
  )

  let reordered: T[]
  if (todayLabelIndex >= 0) {
    reordered = [
      ...data.slice(todayLabelIndex),
      ...data.slice(0, todayLabelIndex),
    ].slice(0, 7)
  } else {
    const idx = data.findIndex((d) => normalize(d.day) === todayShort)
    if (idx <= 0) {
      reordered = data.slice(0, 7)
    } else {
      reordered = [...data.slice(idx), ...data.slice(0, idx)].slice(0, 7)
    }
  }

  // Mark first item as "Today"
  return reordered.map((item, i) => ({
    ...item,
    displayDay: i === 0 ? "Today" : item.day,
  }))
}

export default function Forecast7DayCard({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <section className="w-full rounded-3xl p-4 sm:p-5 md:p-6 bg-white border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={18} className="text-slate-600" />
          <h2 className="text-lg font-semibold tracking-tight">
            7-Day Forecast
          </h2>
        </div>
        <p className="text-sm text-slate-500">No 7-day forecast available</p>
      </section>
    )
  }

  const week = normalizeWeekStart(data)
  const globalMin = Math.min(...week.map((d) => d.min))
  const globalMax = Math.max(...week.map((d) => d.max))
  const span = Math.max(1, globalMax - globalMin)

  return (
    <section className="w-full h-full rounded-3xl p-4 sm:p-5 md:p-6 bg-white border border-slate-200 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays size={18} className="text-slate-600" />
        <h2 className="text-lg font-semibold tracking-tight">
          7-Day Forecast
        </h2>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden flex-1 flex flex-col divide-y divide-slate-200">
        {week.map((day, i) => {
          const Icon = iconFor(day.condition)
          const tint = tintFor(day.condition)

          const leftPct = ((day.min - globalMin) / span) * 100
          const widthPct = ((day.max - day.min) / span) * 100

          return (
            <div
              key={i}
              className="flex flex-1 min-h-[44px] items-center justify-between gap-3 px-3 py-2.5 sm:px-4 bg-white hover:bg-slate-50/70 transition-colors"
            >
              {/* Day */}
              <div className="min-w-[56px]">
                <span className="text-sm font-medium text-slate-900">
                  {day.displayDay}
                </span>
              </div>

              {/* Icon + condition */}
              <div className="flex items-center gap-2 min-w-[0]">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 border border-slate-200/60">
                  <Icon className={["h-4 w-4", tint].join(" ")} />
                </div>
                {day.condition && (
                  <span className="hidden sm:inline text-xs text-slate-500 truncate max-w-[140px]">
                    {day.condition}
                  </span>
                )}
              </div>

              {/* Temps */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 tabular-nums">
                  {Math.round(fToC(day.min))}°
                </span>

                <div className="relative w-20 sm:w-28">
                  <div className="h-2.5 rounded-full bg-slate-200/80" />
                  <div
                    className="absolute top-0 h-2.5 rounded-full bg-gradient-to-r from-sky-400 via-yellow-400 to-orange-500 shadow-[0_0_0_1px_rgba(15,23,42,0.06)]"
                    style={{
                      left: `${Math.max(0, Math.min(100, leftPct))}%`,
                      width: `${Math.max(6, Math.min(100, widthPct))}%`,
                    }}
                    aria-hidden="true"
                  />
                </div>

                <span className="text-sm font-semibold text-slate-900 tabular-nums">
                  {Math.round(fToC(day.max))}°
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
