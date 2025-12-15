"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import {
  Loader2,
  Sparkles,
  MapPin,
  Route,
  Clock,
  BadgeCheck,
  Signal,
  ExternalLink,
  Footprints,
  Bike,
  Car,
  Play,
} from "lucide-react"
import ActivityMap from "@/components/activity-map"

type PlaceRef = {
  id: string
  name: string
  category:
    | "dessert"
    | "cafe"
    | "food"
    | "park"
    | "museum"
    | "mall"
    | "cinema"
    | "gym"
    | "photo"
    | "market"
    | "other"
  lat: number
  lon: number
  distanceM: number
  address?: string
  osmUrl?: string
}

type ApiOut = {
  weatherUsed: { code: number; isDay: boolean; temp: number }
  kind: string
  primary: { headline: string; message: string; place?: PlaceRef }
  secondary: { headline: string; message: string; place?: PlaceRef }[]
}

type TravelMeta = {
  distanceM?: number
  durationS?: number
}

type Mode = "walk" | "bike" | "drive"

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function readWeather(weather: any) {
  const isDay = typeof weather?.is_day === "number" ? weather.is_day === 1 : true
  const code = Number(weather?.weather_code ?? weather?.current?.weather_code ?? 0) || 0
  const temp = Number(weather?.temperature_2m ?? weather?.current?.temperature_2m ?? 30) || 30
  return { code, isDay, temp }
}

function formatDuration(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) return null
  const s = Math.max(0, Math.round(seconds))
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const mm = m % 60
  return mm ? `${h}h ${mm}m` : `${h}h`
}

function timeAgo(ms?: number, now?: number) {
  if (!ms || !now) return null
  const diff = Math.max(0, Math.floor((now - ms) / 1000))
  if (diff < 60) return `${diff}s ago`
  const min = Math.floor(diff / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  return `${hr}h ago`
}

function Pill({
  children,
  className,
  variant = "soft",
  size = "md",
}: {
  children: React.ReactNode
  className?: string
  variant?: "soft" | "outline"
  size?: "md" | "sm"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full whitespace-nowrap",
        size === "sm" ? "px-2.5 py-1 text-[11px] leading-none" : "px-3 py-2 text-xs",
        variant === "outline"
          ? "bg-white text-slate-700 border border-slate-200"
          : "bg-slate-100 text-slate-700",
        className
      )}
    >
      {children}
    </span>
  )
}

function ModeChip({
  active,
  label,
  icon,
  onClick,
  className,
  size = "md",
}: {
  active: boolean
  label: string
  icon: React.ReactNode
  onClick: () => void
  className?: string
  size?: "md" | "sm"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition whitespace-nowrap",
        size === "sm" ? "px-2.5 py-1 text-[11px] leading-none" : "px-3 py-2 text-xs",
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
        className
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function cleanSubtitle(text?: string) {
  if (!text) return ""
  const noDist = text.replace(/\s*·\s*~?\s*\d+\s*m\s*away\b/gi, "")
  const trimmed = noDist.trim()
  if (/^(dessert|cafe|food|park|museum|mall|cinema|gym|photo|market|other)$/i.test(trimmed)) return ""
  return trimmed
}

const SUBTITLE_VARIANTS: Record<string, string[]> = {
  food: ["Tasty spot worth the detour", "Great bite for a quick break", "Good place to eat and chill", "Perfect for hanging out"],
  cafe: ["Cozy cafe to relax", "Nice coffee stop nearby", "Quiet spot to recharge", "Great place to work a bit"],
  dessert: ["Sweet treat nearby", "Dessert that hits the spot", "Sugar break time 🍰", "A little reward walk"],
  park: ["Fresh air and a chill stroll", "Nice place to unwind", "Good for a short walk", "Relaxing outdoor break"],
  museum: ["Quick culture break nearby", "Interesting place to explore", "Small adventure close by", "Worth a look if you have time"],
  mall: ["Browse, shop, and cool down", "Good place to wander", "Quick indoor escape", "Shopping + snacks time"],
  cinema: ["Movie time nearby", "Chill with a film", "Good evening plan", "Quick entertainment break"],
  gym: ["Quick workout spot", "Good place to move", "Short training session?", "Get a sweat in nearby"],
  market: ["Local finds and snacks", "Good place to browse", "Street vibes + food", "Explore local goodies"],
  photo: ["Nice spot for photos", "Good views nearby", "Cool place to capture", "Quick photo walk"],
  other: ["Nice spot nearby", "Worth checking out", "Quick stop if you’re close", "Something fun nearby"],
}
function metricPillClass(kind: "distance" | "time") {
  if (kind === "distance") return "border border-blue-100 bg-blue-50 text-blue-700"
  return "border border-violet-100 bg-violet-50 text-violet-700"
}

function categoryPillClass(category?: string) {
  const c = (category || "other").toLowerCase()
  switch (c) {
    case "food":
      return "border border-orange-100 bg-orange-50 text-orange-700"
    case "cafe":
      return "border border-amber-100 bg-amber-50 text-amber-800"
    case "dessert":
      return "border border-pink-100 bg-pink-50 text-pink-700"
    case "park":
      return "border border-emerald-100 bg-emerald-50 text-emerald-700"
    case "museum":
      return "border border-indigo-100 bg-indigo-50 text-indigo-700"
    case "cinema":
      return "border border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700"
    case "gym":
      return "border border-red-100 bg-red-50 text-red-700"
    case "market":
      return "border border-lime-100 bg-lime-50 text-lime-700"
    case "photo":
      return "border border-cyan-100 bg-cyan-50 text-cyan-700"
    case "mall":
    default:
      return "border border-slate-200 bg-slate-50 text-slate-700"
  }
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleWithRng<T>(arr: T[], rng: () => number) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function PrimaryCard({
  data,
  clickable,
  active,
  onSelect,
  travel,
}: {
  data: ApiOut["primary"]
  clickable?: boolean
  active?: boolean
  onSelect?: () => void
  travel?: TravelMeta | null
}) {
  const Box: any = clickable ? "button" : "div"
  const eta = formatDuration(travel?.durationS)

  return (
    <Box
      type={clickable ? "button" : undefined}
      onClick={clickable ? onSelect : undefined}
      className={cn(
        "w-full rounded-3xl border bg-white shadow-sm p-5 text-left transition",
        clickable && "hover:shadow-md hover:-translate-y-[1px]",
        active ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"
      )}
    >
      <div className="flex items-center gap-2 text-slate-900">
        <Sparkles className="w-5 h-5" />
        <div className="font-semibold">{data.headline}</div>
      </div>

      <div className="mt-3 text-slate-800 leading-relaxed">
        <span
          dangerouslySetInnerHTML={{
            __html: data.message.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>"),
          }}
        />
      </div>

      {data.place && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-700">
          <Pill className="border border-blue-100 bg-blue-50 text-blue-700">
            <Route className="w-3.5 h-3.5" />
            ~{Math.round((travel?.distanceM ?? data.place.distanceM) || 0)}m
          </Pill>

          {eta && (
            <Pill className="border border-violet-100 bg-violet-50 text-violet-700">
              <Clock className="w-3.5 h-3.5" />
              {eta}
            </Pill>
          )}

          <Pill className={categoryPillClass(data.place.category)}>{data.place.category}</Pill>

          {data.place.address && (
            <Pill className="max-w-full">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[260px]">{data.place.address}</span>
            </Pill>
          )}
        </div>
      )}

      {clickable && <div className="mt-3 text-xs text-slate-500">Click to route to this place</div>}
    </Box>
  )
}

function SuggestionCard({
  title,
  subtitle,
  address,
  active,
  onSelect,
  category,
  travel,
  distanceFallbackM,
}: {
  title: string
  subtitle: string
  address?: string
  active: boolean
  onSelect?: () => void
  category?: string
  travel?: TravelMeta | null
  distanceFallbackM?: number
}) {
  const eta = formatDuration(travel?.durationS)
  const distM =
    typeof travel?.distanceM === "number"
      ? travel.distanceM
      : typeof distanceFallbackM === "number"
        ? distanceFallbackM
        : undefined

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "text-left rounded-2xl border bg-white p-4 transition",
        "hover:shadow-sm hover:-translate-y-[1px]",
        active ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200",
        "min-h-[140px] sm:h-[140px] w-full flex flex-col"

      )}
    >
      <div className="min-h-0">
        <div className="font-semibold text-slate-900 text-[15px] leading-snug line-clamp-2">{title}</div>
        {subtitle ? <div className="text-sm text-slate-600 mt-1 line-clamp-1">{subtitle}</div> : null}
      </div>

      <div className="mt-auto pt-3">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Pill size="sm" className={cn("w-full justify-center", metricPillClass("distance"))}>
            <Route className="w-3.5 h-3.5 shrink-0" />
            {typeof distM === "number" ? `~${Math.round(distM)}m` : "—"}
          </Pill>

          <Pill size="sm" className={cn("w-full justify-center", metricPillClass("time"))}>
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {eta ?? "—"}
          </Pill>

          <Pill size="sm" className={cn("w-full justify-center", categoryPillClass(category))}>
            {category ?? "other"}
          </Pill>
        </div>

        <div className={cn("text-xs mt-2 line-clamp-1", address ? "text-slate-500" : "text-slate-400")}>
          {address || " "}
        </div>
      </div>
    </button>
  )
}

function osrmProfile(mode: Mode) {
  if (mode === "walk") return "foot"
  if (mode === "bike") return "bike"
  return "driving"
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

  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsAccuracyM, setGpsAccuracyM] = useState<number | null>(null)
  const [lastGpsAt, setLastGpsAt] = useState<number | null>(null)

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [routeGeojson, setRouteGeojson] = useState<GeoJSON.FeatureCollection | null>(null)
  const [travelById, setTravelById] = useState<Record<string, TravelMeta>>({})

  const [mode, setMode] = useState<Mode>("drive")
  const [, setIsLocked] = useState(false)

  const watchIdRef = useRef<number | null>(null)
  const lastRerouteRef = useRef<{ at: number; lat: number; lon: number; destId: string; mode: Mode } | null>(null)
  const lastTableRef = useRef<{ at: number; lat: number; lon: number; mode: Mode } | null>(null)

  const [phase, setPhase] = useState<"idle" | "loading" | "reveal" | "split">("idle")
  const timerRef = useRef<number | null>(null)

  const [tick, setTick] = useState(0)
  const now = useMemo(() => Date.now(), [tick])

  const [subtitleSeed, setSubtitleSeed] = useState<number>(() => Date.now())

  useEffect(() => {
    const t = window.setInterval(() => setTick((x) => x + 1), 1000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      if (watchIdRef.current != null) {
        try {
          navigator.geolocation.clearWatch(watchIdRef.current)
        } catch {}
        watchIdRef.current = null
      }
    }
  }, [])

  const allPlaces = useMemo(() => {
    const out: PlaceRef[] = []
    if (data?.primary?.place) out.push(data.primary.place)
    for (const s of data?.secondary ?? []) if (s.place) out.push(s.place)
    const m = new Map<string, PlaceRef>()
    for (const p of out) m.set(p.id, p)
    return Array.from(m.values())
  }, [data])

  const selectedPlace = useMemo(() => {
    if (!selectedPlaceId) return null
    return allPlaces.find((p) => p.id === selectedPlaceId) ?? null
  }, [allPlaces, selectedPlaceId])

  const subtitleByPlaceId = useMemo(() => {
    const out: Record<string, string> = {}
    if (!data?.secondary?.length) return out

    const rng = mulberry32(subtitleSeed)

    const byCat = new Map<string, string[]>()
    for (const s of data.secondary) {
      const place = s.place
      if (!place?.id) continue
      const cat = (place.category ?? "other").toLowerCase()
      const list = byCat.get(cat) ?? []
      list.push(place.id)
      byCat.set(cat, list)
    }

    for (const [cat, ids] of byCat.entries()) {
      const variants = SUBTITLE_VARIANTS[cat] ?? SUBTITLE_VARIANTS.other
      const pool = shuffleWithRng(variants, rng)
      for (let i = 0; i < ids.length; i++) out[ids[i]] = pool[i % pool.length]
    }

    return out
  }, [data?.secondary, subtitleSeed])

  useEffect(() => {
    if (!data) return
    const primaryId = data.primary?.place?.id
    if (primaryId) setSelectedPlaceId(primaryId)
  }, [data])

  async function fetchSuggestions(lat: number, lon: number) {
    const qs = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      code: String(w.code),
      isDay: w.isDay ? "1" : "0",
      temp: String(w.temp),
    })
    const res = await fetch(`/api/suggestion?${qs.toString()}`, { cache: "no-store" })
    if (!res.ok) throw new Error(`API ${res.status}`)
    return (await res.json()) as ApiOut
  }

  async function fetchRoute(userLat: number, userLon: number, destLat: number, destLon: number, m: Mode) {
    const profile = osrmProfile(m)
    const url = `https://router.project-osrm.org/route/v1/${profile}/${userLon},${userLat};${destLon},${destLat}?overview=full&geometries=geojson`
    try {
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) throw new Error("route failed")
      const json = await res.json()
      const route = json?.routes?.[0]
      const coords = route?.geometry?.coordinates
      const geojson =
        Array.isArray(coords) && coords.length
          ? ({
              type: "FeatureCollection",
              features: [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords } }],
            } as GeoJSON.FeatureCollection)
          : null
      return {
        geojson,
        distanceM: route?.distance as number | undefined,
        durationS: route?.duration as number | undefined,
      }
    } catch {
      if (m !== "drive") return fetchRoute(userLat, userLon, destLat, destLon, "drive")
      return { geojson: null as any, distanceM: undefined, durationS: undefined }
    }
  }

  async function fetchTableForPlaces(userLat: number, userLon: number, places: PlaceRef[], m: Mode) {
    if (!places.length) return
    const profile = osrmProfile(m)
    const coords = [`${userLon},${userLat}`, ...places.map((p) => `${p.lon},${p.lat}`)].join(";")
    const url = `https://router.project-osrm.org/table/v1/${profile}/${coords}?sources=0&annotations=duration,distance`
    try {
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) throw new Error("table failed")
      const json = await res.json()
      const durations: number[][] | undefined = json?.durations
      const distances: number[][] | undefined = json?.distances

      const next: Record<string, TravelMeta> = {}
      for (let i = 0; i < places.length; i++) {
        const idx = i + 1
        const dur = Array.isArray(durations?.[0]) ? durations![0][idx] : undefined
        const dist = Array.isArray(distances?.[0]) ? distances![0][idx] : undefined
        next[places[i].id] = {
          durationS: Number.isFinite(dur) ? dur : undefined,
          distanceM: Number.isFinite(dist) ? dist : undefined,
        }
      }
      setTravelById(next)
    } catch {
      if (m !== "drive") return fetchTableForPlaces(userLat, userLon, places, "drive")
    }
  }

  function toRad(d: number) {
    return (d * Math.PI) / 180
  }
  function haversineM(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371000
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(a))
  }

  useEffect(() => {
    const u = userPos
    const d = selectedPlace
    if (!u || !d) {
      setRouteGeojson(null)
      return
    }

    const last = lastRerouteRef.current
    const movedM = last ? haversineM(last.lat, last.lon, u.lat, u.lng) : Number.POSITIVE_INFINITY
    const shouldReroute = !last || last.destId !== d.id || last.mode !== mode || now - last.at > 10_000 || movedM > 25
    if (!shouldReroute) return

    lastRerouteRef.current = { at: now, lat: u.lat, lon: u.lng, destId: d.id, mode }

    void (async () => {
      const r = await fetchRoute(u.lat, u.lng, d.lat, d.lon, mode)
      setRouteGeojson(r.geojson ?? null)
      setTravelById((prev) => ({
        ...prev,
        [d.id]: { distanceM: r.distanceM ?? prev[d.id]?.distanceM, durationS: r.durationS ?? prev[d.id]?.durationS },
      }))
    })()
  }, [userPos?.lat, userPos?.lng, selectedPlaceId, selectedPlace?.lat, selectedPlace?.lon, mode, now])

  useEffect(() => {
    const u = userPos
    if (!u || !data || !allPlaces.length) return

    const last = lastTableRef.current
    const movedM = last ? haversineM(last.lat, last.lon, u.lat, u.lng) : Number.POSITIVE_INFINITY
    const should = !last || last.mode !== mode || now - last.at > 15_000 || movedM > 40
    if (!should) return

    lastTableRef.current = { at: now, lat: u.lat, lon: u.lng, mode }
    void fetchTableForPlaces(u.lat, u.lng, allPlaces, mode)
  }, [userPos?.lat, userPos?.lng, data, allPlaces.length, mode, now])

  async function run(lat: number, lon: number) {
    setLoading(true)
    setPhase("loading")

    try {
      const json = await fetchSuggestions(lat, lon)
      setData(json)
      setSubtitleSeed(Date.now())
      setPhase("reveal")

      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setPhase("split"), 5000)
    } catch (e: any) {
      setData({
        weatherUsed: { ...w },
        kind: "unknown",
        primary: { headline: "Couldn’t fetch nearby ideas", message: `Error: ${e?.message || "Unknown"}` },
        secondary: [],
      })
      setPhase("reveal")
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setPhase("split"), 5000)
    } finally {
      setLoading(false)
    }
  }

  async function handleSuggestGPS() {
    try {
      setRouteGeojson(null)
      lastRerouteRef.current = null
      lastTableRef.current = null
      setTravelById({})
      setIsLocked(false)

      if (watchIdRef.current != null) {
        try {
          navigator.geolocation.clearWatch(watchIdRef.current)
        } catch {}
        watchIdRef.current = null
      }

      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000 })
      )

      setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      setGpsAccuracyM(pos.coords.accuracy ?? null)
      setLastGpsAt(Date.now())

      try {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (p) => {
            setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude })
            setGpsAccuracyM(p.coords.accuracy ?? null)
            setLastGpsAt(Date.now())
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
        )
      } catch {}

      await run(pos.coords.latitude, pos.coords.longitude)
    } catch (e: any) {
      setData({
        weatherUsed: { ...w },
        kind: "unknown",
        primary: { headline: "Couldn’t use GPS", message: `Error: ${e?.message || "GPS unavailable"}` },
        secondary: [],
      })
      setPhase("reveal")
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setPhase("split"), 5000)
    }
  }

  async function handleSuggestSelectedCity() {
    const lat = Number(selectedLat)
    const lon = Number(selectedLon)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return

    setRouteGeojson(null)
    lastRerouteRef.current = null
    lastTableRef.current = null
    setTravelById({})
    setIsLocked(false)

    if (watchIdRef.current != null) {
      try {
        navigator.geolocation.clearWatch(watchIdRef.current)
      } catch {}
      watchIdRef.current = null
    }

    setUserPos({ lat, lng: lon })
    setGpsAccuracyM(null)
    setLastGpsAt(Date.now())

    await run(lat, lon)
  }

  const selectedCityReady =
    !!selectedCityEnabled && Number.isFinite(Number(selectedLat)) && Number.isFinite(Number(selectedLon))
  const canShowMap = !!userPos && !!selectedPlace

  const updatedAgo = timeAgo(lastGpsAt ?? undefined, now)
  const highAccuracy = gpsAccuracyM != null && gpsAccuracyM <= 30

  const gTravelMode = mode === "walk" ? "walking" : mode === "bike" ? "bicycling" : "driving"
  const aDirFlg = mode === "walk" ? "w" : mode === "bike" ? "b" : "d"

  const googleMapsHref =
    userPos && selectedPlace
      ? `https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lng}&destination=${selectedPlace.lat},${selectedPlace.lon}&travelmode=${gTravelMode}`
      : "#"

  const appleMapsHref =
    userPos && selectedPlace
      ? `https://maps.apple.com/?saddr=${userPos.lat},${userPos.lng}&daddr=${selectedPlace.lat},${selectedPlace.lon}&dirflg=${aDirFlg}`
      : "#"

  function selectPlace(id: string) {
    setSelectedPlaceId(id)
  }

  return (
    <section className="w-full rounded-3xl p-4 sm:p-5 md:p-6 bg-white border border-slate-200">
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
              "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 w-full",
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
                "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 w-full",
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

      <div className="mt-5 relative rounded-3xl border border-slate-200 bg-slate-50 overflow-hidden min-h-[260px] p-4">
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
                className="relative h-full"
              >
                {canShowMap && (
                  <div className="absolute inset-0 opacity-0 pointer-events-none">
                    <ActivityMap
                      center={{ lng: selectedPlace!.lon, lat: selectedPlace!.lat }}
                      user={{ lng: userPos!.lng, lat: userPos!.lat }}
                      destination={{ lng: selectedPlace!.lon, lat: selectedPlace!.lat }}
                      routeGeojson={routeGeojson}
                      places={allPlaces}
                      selectedPlaceId={selectedPlaceId ?? undefined}
                      onSelectPlace={(id) => selectPlace(id)}
                    />
                  </div>
                )}

                <div className="relative z-10 h-full flex items-center justify-center">
                  <div className="w-full max-w-3xl">
                    <PrimaryCard
                      data={data.primary}
                      clickable={!!data.primary.place?.id}
                      active={data.primary.place?.id === selectedPlaceId}
                      onSelect={() => {
                        const id = data.primary.place?.id
                        if (id) selectPlace(id)
                      }}
                      travel={data.primary.place?.id ? travelById[data.primary.place.id] : null}
                    />
                  </div>
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
                {/* Left column */}
                <div className="space-y-3">
                  {canShowMap ? (
                    <>
                      <ActivityMap
                        center={{ lng: selectedPlace!.lon, lat: selectedPlace!.lat }}
                        user={{ lng: userPos!.lng, lat: userPos!.lat }}
                        destination={{ lng: selectedPlace!.lon, lat: selectedPlace!.lat }}
                        routeGeojson={routeGeojson}
                        places={allPlaces}
                        selectedPlaceId={selectedPlaceId ?? undefined}
                        onSelectPlace={(id) => selectPlace(id)}
                      />

                      <div className="mt-3">
                        {/* MOBILE / TABLET */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-3 lg:hidden">
                          {/* Row 1: Accuracy + Updated */}
                          <div className="grid grid-cols-2 gap-2">
                            <Pill size="sm" variant="outline" className="w-full justify-center">
                              {highAccuracy ? <BadgeCheck className="w-3.5 h-3.5" /> : <Signal className="w-3.5 h-3.5" />}
                              {gpsAccuracyM ? `Accuracy ~${Math.round(gpsAccuracyM)}m` : "Accuracy N/A"}
                            </Pill>

                            <Pill size="sm" variant="outline" className="w-full justify-center">
                              <Clock className="w-3.5 h-3.5" />
                              {updatedAgo ? `Updated ${updatedAgo}` : "Updated —"}
                            </Pill>
                          </div>

                          {/* Row 2: Walk/Bike/Drive */}
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            <ModeChip
                              size="sm"
                              active={mode === "walk"}
                              label="Walk"
                              icon={<Footprints className="w-4 h-4" />}
                              onClick={() => setMode("walk")}
                              className="w-full justify-center"
                            />
                            <ModeChip
                              size="sm"
                              active={mode === "bike"}
                              label="Bike"
                              icon={<Bike className="w-4 h-4" />}
                              onClick={() => setMode("bike")}
                              className="w-full justify-center"
                            />
                            <ModeChip
                              size="sm"
                              active={mode === "drive"}
                              label="Drive"
                              icon={<Car className="w-4 h-4" />}
                              onClick={() => setMode("drive")}
                              className="w-full justify-center"
                            />
                          </div>

                          {/* Row 3: Start + Google + Apple */}
                          <div className="mt-2 grid grid-cols-5 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                // start navigation state (optional)
                              }}
                              className="col-span-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs border border-slate-200 bg-white hover:bg-slate-50"
                            >
                              <Play className="w-4 h-4" />
                              Start
                            </button>

                            <a
                              href={googleMapsHref}
                              target="_blank"
                              rel="noreferrer"
                              className={cn(
                                "col-span-1 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs",
                                "border border-slate-200 bg-white hover:bg-slate-50",
                                !userPos || !selectedPlace ? "pointer-events-none opacity-50" : ""
                              )}
                            >
                              <ExternalLink className="w-4 h-4" />
                              Google
                            </a>

                            <a
                              href={appleMapsHref}
                              target="_blank"
                              rel="noreferrer"
                              className={cn(
                                "col-span-1 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs",
                                "border border-slate-200 bg-white hover:bg-slate-50",
                                !userPos || !selectedPlace ? "pointer-events-none opacity-50" : ""
                              )}
                            >
                              <ExternalLink className="w-4 h-4" />
                              Apple
                            </a>
                          </div>
                        </div>

                        {/* WEB */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-3 hidden lg:block">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-none">
                              <ModeChip
                                size="sm"
                                active={mode === "walk"}
                                label="Walk"
                                icon={<Footprints className="w-4 h-4" />}
                                onClick={() => setMode("walk")}
                              />
                              <ModeChip
                                size="sm"
                                active={mode === "bike"}
                                label="Bike"
                                icon={<Bike className="w-4 h-4" />}
                                onClick={() => setMode("bike")}
                              />
                              <ModeChip
                                size="sm"
                                active={mode === "drive"}
                                label="Drive"
                                icon={<Car className="w-4 h-4" />}
                                onClick={() => setMode("drive")}
                              />
                            </div>

                            <div className="flex items-center gap-2 flex-none">
                              <Pill size="sm" variant="outline">
                                {highAccuracy ? <BadgeCheck className="w-3.5 h-3.5" /> : <Signal className="w-3.5 h-3.5" />}
                                {gpsAccuracyM ? `Accuracy ~${Math.round(gpsAccuracyM)}m` : "Accuracy N/A"}
                              </Pill>

                              <Pill size="sm" variant="outline">
                                <Clock className="w-3.5 h-3.5" />
                                {updatedAgo ? `Updated ${updatedAgo}` : "Updated —"}
                              </Pill>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="inline-flex w-[220px] flex-none items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs border border-slate-200 bg-white hover:bg-slate-50"
                              >
                                <Play className="w-4 h-4" />
                                Start
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={googleMapsHref}
                                target="_blank"
                                rel="noreferrer"
                                className={cn(
                                  "inline-flex w-[120px] flex-none items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs",
                                  "border border-slate-200 bg-white hover:bg-slate-50",
                                  !userPos || !selectedPlace ? "pointer-events-none opacity-50" : ""
                                )}
                              >
                                <ExternalLink className="w-4 h-4" />
                                Google
                              </a>

                              <a
                                href={appleMapsHref}
                                target="_blank"
                                rel="noreferrer"
                                className={cn(
                                  "inline-flex w-[120px] flex-none items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs",
                                  "border border-slate-200 bg-white hover:bg-slate-50",
                                  !userPos || !selectedPlace ? "pointer-events-none opacity-50" : ""
                                )}
                              >
                                <ExternalLink className="w-4 h-4" />
                                Apple
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                      Allow location access to see the map + live tracking.
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-3">Today’s pick</div>
                    <PrimaryCard
                      data={data.primary}
                      clickable={!!data.primary.place?.id}
                      active={data.primary.place?.id === selectedPlaceId}
                      onSelect={() => {
                        const id = data.primary.place?.id
                        if (id) selectPlace(id)
                      }}
                      travel={data.primary.place?.id ? travelById[data.primary.place.id] : null}
                    />
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-3">Other things you can do nearby</div>
                    {data.secondary?.length ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.secondary.map((s, i) => {
                          const p = s.place
                          const pid = p?.id
                          const active = !!pid && pid === selectedPlaceId
                          return (
                            <SuggestionCard
                              key={`${s.headline}-${i}`}
                              title={s.headline}
                              subtitle={cleanSubtitle(s.message) || (pid ? subtitleByPlaceId[pid] : "") || "Nice spot nearby"}
                              address={p?.address}
                              category={p?.category}
                              active={!!active}
                              onSelect={pid ? () => selectPlace(pid) : undefined}
                              travel={pid ? travelById[pid] : null}
                              distanceFallbackM={p?.distanceM}
                            />
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-slate-600">No extra nearby options found this time — try again.</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  )
}
