"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import { Loader2, Sparkles } from "lucide-react"

type ApiOut = {
  weatherUsed: { code: number; isDay: boolean; temp: number }
  kind: string
  primary: { headline: string; message: string; place?: any }
  secondary: { headline: string; message: string; place?: any }[]
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function readWeather(weather: any) {
  const isDay = typeof weather?.is_day === "number" ? weather.is_day === 1 : true
  const code = Number(weather?.weather_code ?? weather?.current?.weather_code ?? 0) || 0
  const temp = Number(weather?.temperature_2m ?? weather?.current?.temperature_2m ?? 30) || 30
  return { code, isDay, temp }
}

function PrimaryCard({ data }: { data: ApiOut["primary"] }) {
  return (
    <motion.div
      layoutId="primary-card"
      className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5"
    >
      <div className="flex items-center gap-2 text-slate-900">
        <Sparkles className="w-5 h-5" />
        <div className="font-semibold">{data.headline}</div>
      </div>

      <div className="mt-3 text-slate-800 leading-relaxed">
        <span
          dangerouslySetInnerHTML={{
            __html: data.message
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/\n/g, "<br/>"),
          }}
        />
      </div>

      {data.place?.address && (
        <div className="mt-3 text-sm text-slate-600">{data.place.address}</div>
      )}

      {data.place?.osmUrl && (
        <a
          className="mt-3 inline-flex text-sm text-blue-700 underline"
          href={data.place.osmUrl}
          target="_blank"
          rel="noreferrer"
        >
          View on OpenStreetMap
        </a>
      )}
    </motion.div>
  )
}

function SecondaryCard({ item }: { item: ApiOut["secondary"][number] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="font-semibold text-slate-900">{item.headline}</div>
      <div className="text-sm text-slate-600 mt-1">{item.message}</div>
      {item.place?.osmUrl && (
        <a
          className="mt-2 inline-flex text-sm text-blue-700 underline"
          href={item.place.osmUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open
        </a>
      )}
    </div>
  )
}

export default function ActivitySection({
  weather,
  location,
  selectedLat,
  selectedLon,
  selectedCityEnabled,
}: {
  weather: any
  location: string
  selectedLat?: number | null
  selectedLon?: number | null
  selectedCityEnabled?: boolean
}) {

  const w = useMemo(() => readWeather(weather), [weather])

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ApiOut | null>(null)

  const [phase, setPhase] = useState<"idle" | "loading" | "reveal" | "split">("idle")
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  async function fetchSuggestions(lat: number, lon: number) {
    const qs = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      code: String(w.code),
      isDay: w.isDay ? "1" : "0",
      temp: String(w.temp),
    })

    const res = await fetch(`/api/suggestion?${qs.toString()}`, { cache: "no-store" })
    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      throw new Error(`API ${res.status}: ${txt || res.statusText}`)
    }
    return (await res.json()) as ApiOut
  }

  async function run(lat: number, lon: number) {
    setLoading(true)
    setPhase("loading")

    try {
      const json = await fetchSuggestions(lat, lon)
      setData(json)
      setPhase("reveal")

      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setPhase("split"), 5000)
    } catch (e: any) {
      const msg = e?.message || "Unknown error"
      setData({
        weatherUsed: { ...w },
        kind: "unknown",
        primary: {
          headline: "Couldn’t fetch nearby ideas",
          message: `Error: ${msg}`,
        },
        secondary: [],
      })
      setPhase("reveal")

      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setPhase("split"), 5000)
    } finally {
      setLoading(false)
    }
  }

  // Button 1: always uses REAL GPS
  async function handleSuggestGPS() {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
        })
      )
      await run(pos.coords.latitude, pos.coords.longitude)
    } catch (e: any) {
      const msg = e?.message || "GPS permission denied / unavailable"
      setData({
        weatherUsed: { ...w },
        kind: "unknown",
        primary: {
          headline: "Couldn’t use GPS",
          message: `Error: ${msg}`,
        },
        secondary: [],
      })
      setPhase("reveal")
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setPhase("split"), 5000)
    }
  }

  // Button 2: uses SEARCHED CITY coords (no GPS)
  async function handleSuggestSelectedCity() {
    const lat = Number(selectedLat)
    const lon = Number(selectedLon)

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      setData({
        weatherUsed: { ...w },
        kind: "unknown",
        primary: {
          headline: "No selected city coordinates",
          message: "Search a city in the header first, then try again.",
        },
        secondary: [],
      })
      setPhase("reveal")
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setPhase("split"), 5000)
      return
    }

    await run(lat, lon)
  }

  const selectedCityReady =
  !!selectedCityEnabled &&
  Number.isFinite(Number(selectedLat)) &&
  Number.isFinite(Number(selectedLon))

  return (
    <section className="w-full rounded-3xl p-5 md:p-6 bg-white border border-slate-200">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Activities</h2>

          <p className="mt-1 text-sm md:text-base text-slate-600">
            Suggestions for <span className="font-medium">{location}</span> based on weather + what’s nearby.
          </p>

          <p className="mt-1 text-xs md:text-sm text-slate-500 italic">
            {selectedCityEnabled
              ? "“Today” uses your real GPS. “Selected city” uses the city you searched in the header."
              : "Note: This section uses your real location (GPS). Search a city to unlock city-based suggestions."}
          </p>

        </div>

        <div className="flex flex-col items-stretch gap-2 w-full sm:w-[320px]">
          <button
            onClick={handleSuggestGPS}
            disabled={loading}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 w-full sm:w-auto",
              "bg-blue-600 text-white disabled:opacity-60"
            )}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Suggestion activity for today
          </button>

          {selectedCityEnabled && (
            <button
              onClick={handleSuggestSelectedCity}
              disabled={loading || !selectedCityReady}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 w-full sm:w-auto",
                "border border-slate-300 bg-white text-slate-900 disabled:opacity-50"
              )}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Selected city activity suggestion
            </button>
          )}

        </div>
      </div>

      <div className="mt-4 text-sm text-slate-600">
        Weather now: code {w.code} · {w.isDay ? "day" : "night"} · {Math.round(w.temp)}°
      </div>

      <div className="mt-5 relative rounded-3xl border border-slate-200 bg-slate-50 overflow-hidden min-h-[280px] p-4">
        <LayoutGroup>
          <AnimatePresence mode="wait">
            {phase === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center text-slate-600"
              >
                Click a button to get today’s idea ✨
              </motion.div>
            )}

            {phase === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center text-slate-700"
              >
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating something nice nearby…
                </div>
              </motion.div>
            )}

            {phase === "reveal" && data && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center p-4"
              >
                <div className="w-full max-w-xl">
                  <PrimaryCard data={data.primary} />
                </div>
              </motion.div>
            )}

            {phase === "split" && data && (
              <motion.div
                key="split"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-3">
                    Other things you can do nearby
                  </div>

                  {data.secondary?.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.secondary.map((s, i) => (
                        <SecondaryCard key={`${s.headline}-${i}`} item={s} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-600">
                      No extra nearby options found this time — try again.
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-3">Today’s pick</div>
                  <PrimaryCard data={data.primary} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  )
}
