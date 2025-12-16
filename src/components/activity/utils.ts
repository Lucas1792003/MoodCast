import type { Mode, WeatherInfo, PlaceRef, SUBTITLE_VARIANTS } from "./types"

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function readWeather(weather: any): WeatherInfo {
  const isDay = typeof weather?.is_day === "number" ? weather.is_day === 1 : true
  const code = Number(weather?.weather_code ?? weather?.current?.weather_code ?? 0) || 0
  const temp = Number(weather?.temperature_2m ?? weather?.current?.temperature_2m ?? 30) || 30
  return { code, isDay, temp }
}

export function formatDuration(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) return null
  const s = Math.max(0, Math.round(seconds))
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const mm = m % 60
  return mm ? `${h}h ${mm}m` : `${h}h`
}

export function timeAgo(ms?: number, now?: number) {
  if (!ms || !now) return null
  const diff = Math.max(0, Math.floor((now - ms) / 1000))
  if (diff < 60) return `${diff}s ago`
  const min = Math.floor(diff / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  return `${hr}h ago`
}

export function cleanSubtitle(text?: string) {
  if (!text) return ""
  const noDist = text.replace(/\s*·\s*~?\s*\d+\s*m\s*away\b/gi, "")
  const trimmed = noDist.trim()
  if (/^(dessert|cafe|food|park|museum|mall|cinema|gym|photo|market|other)$/i.test(trimmed)) return ""
  return trimmed
}

export function metricPillClass(kind: "distance" | "time") {
  if (kind === "distance") return "border border-blue-100 bg-blue-50 text-blue-700"
  return "border border-violet-100 bg-violet-50 text-violet-700"
}

export function categoryPillClass(category?: string) {
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

export function osrmProfile(mode: Mode) {
  if (mode === "walk") return "foot"
  if (mode === "bike") return "bike"
  return "driving"
}

export function toRad(d: number) {
  return (d * Math.PI) / 180
}

export function haversineM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffleWithRng<T>(arr: T[], rng: () => number) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateSubtitleByPlaceId(
  secondary: { headline: string; message: string; place?: PlaceRef }[] | undefined,
  subtitleSeed: number,
  subtitleVariants: typeof SUBTITLE_VARIANTS
): Record<string, string> {
  const out: Record<string, string> = {}
  if (!secondary?.length) return out

  const rng = mulberry32(subtitleSeed)

  const byCat = new Map<string, string[]>()
  for (const s of secondary) {
    const place = s.place
    if (!place?.id) continue
    const cat = (place.category ?? "other").toLowerCase()
    const list = byCat.get(cat) ?? []
    list.push(place.id)
    byCat.set(cat, list)
  }

  for (const [cat, ids] of byCat.entries()) {
    const variants = subtitleVariants[cat] ?? subtitleVariants.other
    const pool = shuffleWithRng(variants, rng)
    for (let i = 0; i < ids.length; i++) out[ids[i]] = pool[i % pool.length]
  }

  return out
}
