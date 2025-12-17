"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Shirt } from "lucide-react"
import LeavesOverlay from "./leaves-overlay"
import { type MoodId, getMoodConfig } from "@/lib/mood-types"

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

type AiOutfit = {
  styleTitle: string
  pieces: Record<Category, string>
  reason?: string
}

interface OutfitSectionProps {
  temperature: number // Fahrenheit
  weatherCode: number
  locationLabel: string
  lat?: number | null
  lon?: number | null
  mood?: MoodId | null // User's selected mood for outfit vibe
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
      accessory: tags.rain || tags.storm ? "Umbrella" : band === "cold" || band === "freezing" ? "Scarf" : "Sunglasses",
    }
    const defaultsFemale: Record<Category, string> = {
      head: "Cap / Beanie",
      outer: "Cardigan / Light jacket",
      top: "Blouse / T-shirt",
      bottom: "Wide-leg pants / Jeans",
      shoes: "Sneakers",
      accessory: tags.rain || tags.storm ? "Umbrella" : band === "cold" || band === "freezing" ? "Scarf" : "Sunglasses",
    }

    const name = gender === "male" ? defaultsMale[cat] : defaultsFemale[cat]
    return { id: `fallback-${gender}-${cat}`, name, category: cat, gender: "unisex", weather: ["any"], regions: ["global"] }
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

function isValidAiOutfit(x: any): x is AiOutfit {
  const cats: Category[] = ["head", "outer", "top", "bottom", "shoes", "accessory"]
  return (
    x &&
    typeof x.styleTitle === "string" &&
    x.pieces &&
    cats.every((k) => typeof x.pieces?.[k] === "string" && x.pieces[k].trim().length > 0)
  )
}

export default function OutfitSection({
  temperature,
  weatherCode,
  locationLabel,
  lat = null,
  lon = null,
  mood = null,
}: OutfitSectionProps) {
  const [gender, setGender] = useState<Gender>("female")
  const [seed, setSeed] = useState(1)

  const [aiLook, setAiLook] = useState<AiOutfit | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // kept only for styleLine/pieces if AI is unavailable (won't be shown if AI exists)
  const fallbackLook = useMemo(() => {
    return buildLook({
      catalog: [],
      gender,
      tempF: temperature,
      weatherCode,
      locationLabel,
      seed,
    })
  }, [gender, temperature, weatherCode, locationLabel, seed])

  // ✅ dedupe + debounce to reduce Gemini quota exhaustion
  const lastRequestKeyRef = useRef<string>("")
  const debounceTimerRef = useRef<any>(null)

  useEffect(() => {
    if (!locationLabel) return

    const controller = new AbortController()
    let cancelled = false

    const moodVibe = mood ? getMoodConfig(mood).outfitVibe : null

    const requestKey = JSON.stringify({
      gender,
      seed,
      locationLabel,
      t: Math.round(temperature), // reduce spam from tiny temp changes
      wc: weatherCode,
      mood: moodVibe,
    })

    // ✅ if same key, don't call again
    if (lastRequestKeyRef.current === requestKey) return
    lastRequestKeyRef.current = requestKey

    async function runAI() {
      setLoading(true)
      setError("")

      try {
        const r = await fetch("/api/ai-outfit", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            gender,
            seed,
            locationLabel,
            temperature: Math.round(temperature),
            weatherCode,
            lat,
            lon,
            moodVibe, // e.g. "active, sporty, vibrant colors" or null
          }),
        })

        const data = await r.json().catch(() => null)

        if (!r.ok) {
          if (r.status === 429 || String(data?.error || "").toLowerCase().includes("resource")) {
            setError("AI quota reached (Gemini free limit). Please try again in a bit.")
            return
          }
          throw new Error(data?.error || `AI outfit failed (${r.status})`)
        }

        if (!cancelled) {
          if (isValidAiOutfit(data)) {
            setAiLook(data)
            setError("")
          } else {
            // keep last aiLook if exists
            setError("AI returned an unexpected format.")
          }
        }
      } catch (e: any) {
        if (!cancelled && e?.name !== "AbortError") {
          setError(aiLook ? "AI is busy right now (showing last result)." : "AI is busy right now. Try again.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    // ✅ debounce collapses multiple updates into a single AI call
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(runAI, 400)

    return () => {
      cancelled = true
      controller.abort()
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
    // ⚠️ intentionally exclude lat/lon from deps to prevent extra calls from tiny changes
  }, [gender, seed, locationLabel, temperature, weatherCode, mood])

  const otherGender: Gender = gender === "male" ? "female" : "male"

  const styleLine = aiLook?.styleTitle ?? fallbackLook.style
  const pieceName = (cat: Category) => aiLook?.pieces?.[cat] ?? fallbackLook.pieces[cat].name

  return (
    <div className="relative isolate overflow-hidden bg-card rounded-2xl border border-border p-5 sm:p-8 shadow-sm">
      <LeavesOverlay variant={gender === "female" ? "sakura" : "autumn"} />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <Shirt className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h3 className="text-lg sm:text-lg font-semibold leading-tight text-foreground break-words">
                {gender === "female" ? "Female" : "Male"} Outfit Suggestion
              </h3>
              <p className="text-xs text-muted-foreground">One full look based on weather + local vibe</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setGender(otherGender)
                setSeed(1)
                setError("")
              }}
              className="rounded-full border border-border px-3 py-1.5 text-xs sm:text-sm text-foreground hover:bg-muted transition disabled:opacity-60 disabled:pointer-events-none"
              title={`Switch to ${otherGender}`}
            >
              Gender
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setError("")
                setSeed((s) => s + 1)
              }}
              className="rounded-full bg-primary px-3 py-1.5 text-xs sm:text-sm text-primary-foreground hover:opacity-90 transition disabled:opacity-60 disabled:pointer-events-none"
              title="Generate a new combination"
            >
              {loading ? "..." : "More"}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-muted-foreground mb-3">{error}</p>}

        <p className="text-primary font-semibold mb-4 text-base sm:text-base">
          {loading ? "Finding outfits..." : styleLine}
        </p>

        <div className="space-y-2">
          {(
            [
              ["Head", "head"],
              ["Outer", "outer"],
              ["Top", "top"],
              ["Bottom", "bottom"],
              ["Shoes", "shoes"],
              ["Accessory", "accessory"],
            ] as const
          ).map(([label, cat]) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span className="text-xs text-muted-foreground w-20">{label}</span>
              <span className="text-foreground text-sm">{pieceName(cat)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
