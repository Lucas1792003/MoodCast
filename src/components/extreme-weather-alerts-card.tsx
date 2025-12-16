"use client"

import {
  AlertTriangle,
  ShieldCheck,
  Flame,
  Snowflake,
  CloudLightning,
  Droplets,
  Wind,
} from "lucide-react"

type AlertKind = "storm" | "heat" | "cold" | "flood" | "wind"

type WeatherAlert = {
  kind: AlertKind
  title: string
  detail?: string
  severity?: "low" | "moderate" | "high"
}

type Severity = NonNullable<WeatherAlert["severity"]>

// Keep these flexible to match whatever your adapters return
type HourlyForecastLike = {
  time: string
  temperature: number
  condition?: string
}

type DailyForecastLike = {
  time?: string
  date?: string
  tempMax?: number
  tempMin?: number
  temperatureMax?: number
  temperatureMin?: number
  condition?: string
}

type Props = {
  alerts?: WeatherAlert[]
  hourly?: HourlyForecastLike[]
  daily?: DailyForecastLike[]
  windSpeed?: number | null
  precipitationProbability?: number | null
  currentWeatherCode?: number | null
}

function metaFor(kind: AlertKind) {
  switch (kind) {
    case "storm":
      return {
        Icon: CloudLightning,
        tint: "text-violet-700",
        chip: "bg-violet-50 text-violet-800 ring-violet-200",
      }
    case "heat":
      return {
        Icon: Flame,
        tint: "text-amber-700",
        chip: "bg-amber-50 text-amber-800 ring-amber-200",
      }
    case "cold":
      return {
        Icon: Snowflake,
        tint: "text-sky-700",
        chip: "bg-sky-50 text-sky-800 ring-sky-200",
      }
    case "flood":
      return {
        Icon: Droplets,
        tint: "text-blue-700",
        chip: "bg-blue-50 text-blue-800 ring-blue-200",
      }
    case "wind":
      return {
        Icon: Wind,
        tint: "text-teal-700",
        chip: "bg-teal-50 text-teal-800 ring-teal-200",
      }
  }
}

function severityPill(sev?: WeatherAlert["severity"]) {
  if (sev === "high") return "bg-rose-50 text-rose-800 ring-rose-200"
  if (sev === "moderate") return "bg-orange-50 text-orange-800 ring-orange-200"
  return "bg-slate-50 text-slate-700 ring-slate-200"
}

// Basic Open-Meteo-ish storm/thunder codes: 95–99
function isThunderCode(code: number | null | undefined) {
  return typeof code === "number" && code >= 95 && code <= 99
}

function inferAlertsFromInputs({
  hourly,
  windSpeed,
  precipitationProbability,
  currentWeatherCode,
}: Pick<
  Props,
  "hourly" | "windSpeed" | "precipitationProbability" | "currentWeatherCode"
>): WeatherAlert[] {
  const list: WeatherAlert[] = []

  const h = (hourly ?? []).slice(0, 24)
  const temps = h.map((x) => x.temperature).filter((t) => Number.isFinite(t))
  const maxT = temps.length ? Math.max(...temps) : null
  const minT = temps.length ? Math.min(...temps) : null

  const condText = h.map((x) => (x.condition ?? "").toLowerCase()).join(" | ")
  const windy = typeof windSpeed === "number" ? windSpeed : null
  const pop =
    typeof precipitationProbability === "number"
      ? precipitationProbability
      : null

  // NOTE: thresholds assume Fahrenheit + mph-ish. Adjust if your app uses C/kmh.
  if (windy !== null) {
    if (windy >= 35) {
      list.push({
        kind: "wind",
        title: "Strong winds expected",
        detail: `Wind speed around ${Math.round(windy)}.`,
        severity: "high",
      })
    } else if (windy >= 25) {
      list.push({
        kind: "wind",
        title: "Breezy conditions",
        detail: `Wind speed around ${Math.round(windy)}.`,
        severity: "moderate",
      })
    }
  }

  const thunder =
    isThunderCode(currentWeatherCode) ||
    condText.includes("thunder") ||
    condText.includes("storm")

  if (thunder) {
    list.push({
      kind: "storm",
      title: "Thunderstorm risk",
      detail: "Lightning/thunder signals detected in the forecast.",
      severity: "high",
    })
  } else if (pop !== null && pop >= 70) {
    list.push({
      kind: "storm",
      title: "Rain likely",
      detail: `Precipitation chance around ${Math.round(pop)}%.`,
      severity: pop >= 85 ? "high" : "moderate",
    })
  }

  if (
    pop !== null &&
    pop >= 85 &&
    (condText.includes("rain") ||
      condText.includes("shower") ||
      condText.includes("drizzle"))
  ) {
    list.push({
      kind: "flood",
      title: "Heavy rain / flooding risk",
      detail: `High precipitation probability (${Math.round(
        pop
      )}%). Stay alert for local advisories.`,
      severity: "moderate",
    })
  }

  if (maxT !== null) {
    if (maxT >= 100) {
      list.push({
        kind: "heat",
        title: "Extreme heat",
        detail: `High near ${Math.round(
          maxT
        )}°. Hydrate and limit sun exposure.`,
        severity: "high",
      })
    } else if (maxT >= 95) {
      list.push({
        kind: "heat",
        title: "Heat advisory conditions",
        detail: `High near ${Math.round(
          maxT
        )}°. Take breaks and drink water.`,
        severity: "moderate",
      })
    } else if (maxT >= 90) {
      list.push({
        kind: "heat",
        title: "Warm day ahead",
        detail: `High near ${Math.round(maxT)}°. Stay comfortable.`,
        severity: "low",
      })
    }
  }

  if (minT !== null) {
    if (minT <= 15) {
      list.push({
        kind: "cold",
        title: "Extreme cold",
        detail: `Low near ${Math.round(minT)}°. Bundle up and limit exposure.`,
        severity: "high",
      })
    } else if (minT <= 32) {
      list.push({
        kind: "cold",
        title: "Freezing temperatures",
        detail: `Low near ${Math.round(minT)}°. Watch for icy patches.`,
        severity: "moderate",
      })
    }
  }

  // ✅ FIXED: Record keys cannot include undefined
  const order: Record<Severity, number> = { high: 3, moderate: 2, low: 1 }

  const byKind = new Map<AlertKind, WeatherAlert>()
  for (const a of list) {
    const prev = byKind.get(a.kind)
    const aKey: Severity = (a.severity ?? "low") as Severity
    const pKey: Severity = (prev?.severity ?? "low") as Severity

    if (!prev || order[aKey] > order[pKey]) byKind.set(a.kind, a)
  }

  return Array.from(byKind.values())
}

export default function ExtremeWeatherAlertsCard(props: Props) {
  const computed = inferAlertsFromInputs({
    hourly: props.hourly,
    windSpeed: props.windSpeed,
    precipitationProbability: props.precipitationProbability,
    currentWeatherCode: props.currentWeatherCode,
  })

  const list = (props.alerts?.length ? props.alerts : computed).filter(Boolean)
  const hasAlerts = list.length > 0

  return (
    <section className="w-full h-full flex flex-col rounded-3xl p-4 sm:p-5 md:p-6 bg-white border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} className="text-slate-600" />
        <h2 className="text-lg font-semibold tracking-tight">Weather Alerts</h2>
      </div>

      {!hasAlerts ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-200">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  Peaceful vibe
                </p>
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 bg-emerald-50 text-emerald-800 ring-emerald-200">
                  All clear
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                No storm, heatwave, coldwave, or flooding signals detected right
                now.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ring-1 bg-slate-50 text-slate-700 ring-slate-200">
                  Monitoring hourly changes
                </span>
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ring-1 bg-slate-50 text-slate-700 ring-slate-200">
                  Updates automatically
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          {list.map((a, i) => {
            const { Icon, tint, chip } = metaFor(a.kind)
            const sev: Severity = (a.severity ?? "low") as Severity

            return (
              <div
                key={`${a.kind}-${i}`}
                className={[
                  "flex items-start gap-3 px-3 py-3 sm:px-4",
                  "bg-white hover:bg-slate-50/70 transition-colors",
                  i !== list.length - 1 ? "border-b border-slate-200" : "",
                ].join(" ")}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200">
                  <Icon className={["h-5 w-5", tint].join(" ")} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {a.title}
                    </p>

                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
                          chip,
                        ].join(" ")}
                      >
                        {a.kind.toUpperCase()}
                      </span>

                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
                          severityPill(sev),
                        ].join(" ")}
                      >
                        {sev.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {a.detail ? (
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                      {a.detail}
                    </p>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
