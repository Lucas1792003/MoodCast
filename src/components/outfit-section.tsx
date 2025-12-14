"use client"

import { useEffect, useMemo, useState } from "react"
import { Shirt } from "lucide-react"
import LeavesOverlay from "./leaves-overlay"

type Gender = "male" | "female"
type Category = "head" | "outer" | "top" | "bottom" | "shoes" | "accessory"

type OutfitCatalogItem = {
  id: string
  name: string
  category: Category
  gender: "male" | "female" | "unisex"
  minTempF?: number
  maxTempF?: number
  weather?: Array<"any" | "rain" | "snow" | "wind" | "clear" | "cloudy" | "storm">
  regions?: string[]
  styleTags?: string[]
}

type OutfitLook = {
  style: string
  pieces: Record<Category, OutfitCatalogItem>
}

interface OutfitSectionProps {
  temperature: number // Fahrenheit
  weatherCode: number
  locationLabel: string
  lat?: number | null
  lon?: number | null
}

function weatherTagsFromCode(weatherCode: number) {
  const isRain = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)
  const isSnow = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)
  const isStorm = weatherCode >= 95 && weatherCode <= 99
  const isClear = weatherCode === 0 || weatherCode === 1
  const isCloudy = weatherCode === 2 || weatherCode === 3 || weatherCode === 45 || weatherCode === 48
  return { rain: isRain, snow: isSnow, storm: isStorm, clear: isClear, cloudy: isCloudy }
}

function tempBand(tempF: number) {
  if (tempF >= 85) return "hot"
  if (tempF >= 70) return "warm"
  if (tempF >= 55) return "cool"
  if (tempF >= 40) return "cold"
  return "freezing"
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickOne<T>(arr: T[], rand: () => number) {
  if (arr.length === 0) return null
  return arr[Math.floor(rand() * arr.length)] ?? null
}

function normalizeLocationTokens(locationLabel: string) {
  const s = (locationLabel || "").trim()
  if (!s) return ["global"]
  const parts = s.split(",").map((x) => x.trim()).filter(Boolean)
  const city = parts[0] ?? ""
  const country = parts[1] ?? ""
  const tokens = [city, country, city.toLowerCase(), country.toLowerCase(), "global"].filter(Boolean)
  if (country.toLowerCase() === "japan") tokens.push("JP", "jp")
  return tokens
}

function buildLook(opts: {
  catalog: OutfitCatalogItem[]
  gender: Gender
  tempF: number
  weatherCode: number
  locationLabel: string
  seed: number
}): OutfitLook {
  const { gender, tempF, weatherCode, locationLabel, seed, catalog } = opts
  const tags = weatherTagsFromCode(weatherCode)
  const locationTokens = normalizeLocationTokens(locationLabel)
  const band = tempBand(tempF)
  const rand = mulberry32(seed)

  const matchesWeather = (it: OutfitCatalogItem) => {
    const w = it.weather ?? ["any"]
    if (w.includes("any")) return true
    if (tags.rain && w.includes("rain")) return true
    if (tags.snow && w.includes("snow")) return true
    if (tags.storm && w.includes("storm")) return true
    if (tags.clear && w.includes("clear")) return true
    if (tags.cloudy && w.includes("cloudy")) return true
    return false
  }

  const matchesTemp = (it: OutfitCatalogItem) => {
    const min = typeof it.minTempF === "number" ? it.minTempF : -Infinity
    const max = typeof it.maxTempF === "number" ? it.maxTempF : Infinity
    return tempF >= min && tempF <= max
  }

  const matchesRegion = (it: OutfitCatalogItem) => {
    const r = (it.regions ?? ["global"]).map((x) => x.toLowerCase())
    if (r.includes("global")) return true
    return locationTokens.some((t) => r.includes(String(t).toLowerCase()))
  }

  const genderSpecificPool = catalog.filter(
    (it) => it.gender === gender && matchesRegion(it) && matchesTemp(it) && matchesWeather(it)
  )

  const unisexPool = catalog.filter(
    (it) => it.gender === "unisex" && matchesRegion(it) && matchesTemp(it) && matchesWeather(it)
  )

  const byCat = (cat: Category) => {
    const specific = genderSpecificPool.filter((x) => x.category === cat)
    if (specific.length > 0) return specific
    return unisexPool.filter((x) => x.category === cat)
  }

  const fallbackPiece = (cat: Category): OutfitCatalogItem => {
    const defaultsMale: Record<Category, string> = {
      head: "Cap / Beanie",
      outer: "Hoodie / Light jacket",
      top: "Oxford / T-shirt",
      bottom: "Chinos / Jeans",
      shoes: "Sneakers",
      accessory:
        tags.rain || tags.storm ? "Umbrella" : band === "cold" || band === "freezing" ? "Scarf" : "Sunglasses",
    }
    const defaultsFemale: Record<Category, string> = {
      head: "Cap / Beanie",
      outer: "Cardigan / Light jacket",
      top: "Blouse / T-shirt",
      bottom: "Wide-leg pants / Jeans",
      shoes: "Sneakers",
      accessory:
        tags.rain || tags.storm ? "Umbrella" : band === "cold" || band === "freezing" ? "Scarf" : "Sunglasses",
    }

    const name = gender === "male" ? defaultsMale[cat] : defaultsFemale[cat]
    return {
      id: `fallback-${gender}-${cat}`,
      name,
      category: cat,
      gender: "unisex",
      weather: ["any"],
      regions: ["global"],
    }
  }

  const categories: Category[] = ["head", "outer", "top", "bottom", "shoes", "accessory"]

  const pieces = {} as Record<Category, OutfitCatalogItem>
  for (const cat of categories) {
    const picked = pickOne(byCat(cat), rand) ?? fallbackPiece(cat)
    pieces[cat] = picked
  }

  const style =
    band === "hot"
      ? "Light & Breezy"
      : band === "warm"
        ? "Easy Comfort"
        : band === "cool"
          ? "Layered Casual"
          : band === "cold"
            ? "Warm Layers"
            : "Winter Armor"

  const weatherNote = tags.rain || tags.storm ? " (Rain-ready)" : tags.snow ? " (Snow-ready)" : ""
  const city = (locationLabel || "").split(",")[0]?.trim()
  const regional = city ? ` • ${city}` : ""

  return { style: `${style}${weatherNote}${regional}`, pieces }
}

export default function OutfitSection({
  temperature,
  weatherCode,
  locationLabel,
  lat = null,
  lon = null,
}: OutfitSectionProps) {
  const [gender, setGender] = useState<Gender>("female")
  const [seed, setSeed] = useState(1)
  const [catalog, setCatalog] = useState<OutfitCatalogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoading(true)
      setError("")
      try {
        const qs = new URLSearchParams({
          location: locationLabel || "",
          gender,
          tempF: String(temperature),
          weatherCode: String(weatherCode),
        })
        if (typeof lat === "number") qs.set("lat", String(lat))
        if (typeof lon === "number") qs.set("lon", String(lon))

        const r = await fetch(`/api/outfits?${qs.toString()}`, { cache: "no-store" })
        if (!r.ok) throw new Error("Outfit API failed")
        const data = await r.json()
        if (!cancelled) setCatalog(Array.isArray(data?.items) ? data.items : [])
      } catch {
        if (!cancelled) setError("Couldn’t load outfit catalog.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [gender, locationLabel, lat, lon, temperature, weatherCode])

  const look = useMemo(() => {
    return buildLook({
      catalog,
      gender,
      tempF: temperature,
      weatherCode,
      locationLabel,
      seed,
    })
  }, [catalog, gender, temperature, weatherCode, locationLabel, seed])

  const otherGender: Gender = gender === "male" ? "female" : "male"

  return (
    <div className="relative isolate overflow-hidden bg-card rounded-2xl border border-border p-8 shadow-sm">
      {/* 🌸 female = sakura petals, 🍁 male = autumn leaves (behind everything) */}
      <LeavesOverlay variant={gender === "female" ? "sakura" : "autumn"} />

      {/* content always above overlay */}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Shirt className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">{gender === "female" ? "Female" : "Male"} Outfit Suggestion</h3>
              <p className="text-xs text-muted-foreground">One full look based on weather + local vibe</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setGender(otherGender)
                setSeed(1)
              }}
              className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted transition"
              title={`Switch to ${otherGender}`}
            >
              {/* {otherGender === "male" ? "Male" : "Female"} */}
              Gender
            </button>

            <button
              type="button"
              onClick={() => setSeed((s) => s + 1)}
              className="rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition"
              title="Generate a new combination"
            >
              More
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-muted-foreground mb-3">{error}</p>}

        <p className="text-primary font-semibold mb-4">{loading ? "Finding outfits..." : look.style}</p>

        <div className="space-y-2">
          {(
            [
              ["Head", look.pieces.head],
              ["Outer", look.pieces.outer],
              ["Top", look.pieces.top],
              ["Bottom", look.pieces.bottom],
              ["Shoes", look.pieces.shoes],
              ["Accessory", look.pieces.accessory],
            ] as const
          ).map(([label, piece]) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span className="text-xs text-muted-foreground w-20">{label}</span>
              <span className="text-foreground text-sm">{piece.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
