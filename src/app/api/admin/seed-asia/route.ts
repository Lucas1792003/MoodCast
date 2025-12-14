import { head, del, put } from "@vercel/blob"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const DATASET_PATHNAME = "datasets/outfits-latest.json"

type Category = "head" | "outer" | "top" | "bottom" | "shoes" | "accessory"
type Gender = "female" | "male" | "unisex"
type WeatherTag = "any" | "rain" | "snow" | "wind" | "clear" | "cloudy" | "storm"

type AiOutfit = {
  styleTitle: string
  pieces: Record<Category, string>
  reason?: string
}

type Outfit = {
  id: string
  region: string // country name lowercase, e.g. "thailand", "united states"
  gender: Gender
  min_temp_c: number
  max_temp_c: number
  weather_tags: WeatherTag[]
  outfit_json: AiOutfit
  keywords: string[]
}

type Dataset = {
  version: number
  generatedAt: string | null
  outfits: Outfit[]
}

function assertAdmin(request: Request) {
  const auth = request.headers.get("authorization") || ""
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  return null
}

async function loadExistingDataset(): Promise<Dataset> {
  try {
    const meta = await head(DATASET_PATHNAME)
    const res = await fetch(meta.url, { cache: "no-store" })
    if (!res.ok) throw new Error("fetch failed")
    return (await res.json()) as Dataset
  } catch {
    return { version: 1, generatedAt: null, outfits: [] }
  }
}

function mergeDedupe(oldData: Dataset, newOutfits: Outfit[]): Dataset {
  const map = new Map<string, Outfit>()
  for (const o of oldData.outfits) map.set(o.id, o)
  for (const o of newOutfits) map.set(o.id, o) // same id replaces
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    outfits: Array.from(map.values()),
  }
}

async function overwriteJson(pathname: string, jsonString: string) {
  try {
    const meta = await head(pathname)
    await del(meta.url)
  } catch {
    // ignore if it doesn't exist
  }

  await put(pathname, jsonString, {
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 60 * 10,
    access: "public",
  })
}

// --- Your style label format ---
function bandToStyleLabel(band: string) {
  if (band === "hot") return "Light & Breezy"
  if (band === "warm") return "Easy Comfort"
  if (band === "mild") return "Everyday Layers"
  if (band === "cool") return "Layered Casual"
  if (band === "cold") return "Warm Layers"
  return "Everyday Fit"
}

// ------------------ ASIA ------------------

// Asia targets (country token + display city)
const ASIA_REGIONS: Array<{ region: string; city: string }> = [
  { region: "thailand", city: "Bangkok" },
  { region: "singapore", city: "Singapore" },
  { region: "malaysia", city: "Kuala Lumpur" },
  { region: "vietnam", city: "Ho Chi Minh City" },
  { region: "indonesia", city: "Jakarta" },
  { region: "philippines", city: "Manila" },
  { region: "japan", city: "Tokyo" },
  { region: "south korea", city: "Seoul" },
  { region: "hong kong", city: "Hong Kong" },
  { region: "taiwan", city: "Taipei" },
  { region: "india", city: "Mumbai" },
  { region: "china", city: "Shanghai" },
]

// temp bands (C) – Asia-focused
const TEMP_BANDS_ASIA = [
  { label: "hot", min: 28, max: 40 },
  { label: "warm", min: 22, max: 30 },
  { label: "cool", min: 16, max: 24 },
] as const

const WEATHER_ASIA: WeatherTag[] = ["clear", "cloudy", "rain"]

// ------------------ WESTERN ------------------

const WESTERN_REGIONS: Array<{ region: string; city: string }> = [
  { region: "united states", city: "New York" },
  { region: "united kingdom", city: "London" },
  { region: "france", city: "Paris" },
  { region: "germany", city: "Berlin" },
  { region: "canada", city: "Toronto" },
  { region: "australia", city: "Sydney" },
  { region: "spain", city: "Barcelona" },
  { region: "italy", city: "Milan" },
  { region: "netherlands", city: "Amsterdam" },
  { region: "sweden", city: "Stockholm" },
]

// temp bands (C) – Western-focused (includes cold + mild)
const TEMP_BANDS_WESTERN = [
  { label: "cold", min: -5, max: 5 },
  { label: "cool", min: 5, max: 14 },
  { label: "mild", min: 12, max: 20 },
  { label: "warm", min: 18, max: 26 },
  { label: "hot", min: 24, max: 35 },
] as const

const WEATHER_WESTERN: WeatherTag[] = ["clear", "cloudy", "rain", "wind", "snow"]

// ------------------ shared helpers ------------------

function makeTemplatePieces(
  gender: Gender,
  weather: WeatherTag,
  band: string,
  variant: number
) {
  const rainy = weather === "rain" || weather === "storm"
  const snowy = weather === "snow"
  const wet = rainy || snowy
  const windy = weather === "wind"
  const coolish = band === "cool" || band === "cold"

  // small variation so "More" feels different
  const v = variant % 2

  if (gender === "female") {
    return {
      head: snowy ? (v ? "Beanie" : "Warm beanie") : wet ? (v ? "Bucket hat" : "Cap") : "Cap / Beanie",
      outer: snowy
        ? (v ? "Insulated waterproof jacket" : "Parka")
        : wet
          ? (v ? "Packable rain jacket" : "Light rain jacket")
          : coolish
            ? (v ? "Light jacket" : "Cardigan / Light jacket")
            : (v ? "Cardigan" : "Light jacket"),
      top: coolish ? (v ? "Long-sleeve top" : "Turtleneck / Long-sleeve") : v ? "Blouse / T-shirt" : "T-shirt / Tank",
      bottom: v ? "Wide-leg pants / Jeans" : "Skirt / Shorts",
      shoes: snowy ? "Waterproof boots" : wet ? "Water-resistant sneakers" : "Sneakers",
      accessory: snowy
        ? (v ? "Gloves" : "Scarf")
        : wet
          ? "Umbrella"
          : windy
            ? (v ? "Light scarf" : "Cap")
            : (v ? "Sunglasses" : "Tote bag"),
    } as Record<Category, string>
  }

  // male
  return {
    head: snowy ? (v ? "Beanie" : "Warm beanie") : wet ? (v ? "Cap" : "Bucket hat") : "Cap / Beanie",
    outer: snowy
      ? (v ? "Insulated waterproof jacket" : "Parka")
      : wet
        ? (v ? "Packable rain jacket" : "Light rain jacket")
        : coolish
          ? (v ? "Light jacket" : "Overshirt / Light jacket")
          : (v ? "Overshirt" : "Light jacket"),
    top: coolish ? (v ? "Long-sleeve tee" : "Sweater / Long-sleeve") : v ? "T-shirt / Polo" : "T-shirt / Oxford",
    bottom: v ? "Chinos / Jeans" : "Shorts / Chinos",
    shoes: snowy ? "Waterproof boots" : wet ? "Water-resistant sneakers" : "Sneakers",
    accessory: snowy
      ? (v ? "Gloves" : "Scarf")
      : wet
        ? "Umbrella"
        : windy
          ? (v ? "Windbreaker" : "Cap")
          : (v ? "Watch" : "Sunglasses"),
  } as Record<Category, string>
}

function slug(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

function buildAsiaStarter(): Outfit[] {
  const genders: Gender[] = ["female", "male"]
  const variantsPerCombo = 2
  const out: Outfit[] = []

  for (const { region, city } of ASIA_REGIONS) {
    for (const gender of genders) {
      for (const w of WEATHER_ASIA) {
        for (const band of TEMP_BANDS_ASIA) {
          for (let v = 0; v < variantsPerCombo; v++) {
            const styleTitle = `${bandToStyleLabel(band.label)} • ${city}`

            out.push({
              id: `seed_asia_${slug(region)}_${gender}_${band.label}_${w}_v${v}`,
              region,
              gender,
              min_temp_c: band.min,
              max_temp_c: band.max,
              weather_tags: [w],
              outfit_json: {
                styleTitle,
                pieces: makeTemplatePieces(gender, w, band.label, v),
                reason: `Starter pack for ${city} (${band.label}, ${w}).`,
              },
              keywords: [region, city.toLowerCase(), gender, band.label, w, "asia"],
            })
          }
        }
      }
    }
  }

  return out
}

function buildWesternStarter(): Outfit[] {
  const genders: Gender[] = ["female", "male"]
  const variantsPerCombo = 2
  const out: Outfit[] = []

  for (const { region, city } of WESTERN_REGIONS) {
    for (const gender of genders) {
      for (const band of TEMP_BANDS_WESTERN) {
        for (const w of WEATHER_WESTERN) {
          // avoid silly snow combos in hot/warm bands
          if (w === "snow" && !(band.label === "cold" || band.label === "cool")) continue

          for (let v = 0; v < variantsPerCombo; v++) {
            const styleTitle = `${bandToStyleLabel(band.label)} • ${city}`

            out.push({
              id: `seed_west_${slug(region)}_${gender}_${band.label}_${w}_v${v}`,
              region,
              gender,
              min_temp_c: band.min,
              max_temp_c: band.max,
              weather_tags: [w],
              outfit_json: {
                styleTitle,
                pieces: makeTemplatePieces(gender, w, band.label, v),
                reason: `Starter pack for ${city} (${band.label}, ${w}).`,
              },
              keywords: [region, city.toLowerCase(), gender, band.label, w, "western"],
            })
          }
        }
      }
    }
  }

  return out
}

export async function POST(request: Request) {
  const unauthorized = assertAdmin(request)
  if (unauthorized) return unauthorized

  const existing = await loadExistingDataset()

  const asiaStarter = buildAsiaStarter()
  const westStarter = buildWesternStarter()
  const starter = [...asiaStarter, ...westStarter]

  const merged = mergeDedupe(existing, starter)

  await overwriteJson(DATASET_PATHNAME, JSON.stringify(merged))

  return NextResponse.json({
    ok: true,
    added: starter.length,
    added_asia: asiaStarter.length,
    added_western: westStarter.length,
    before: existing.outfits.length,
    after: merged.outfits.length,
    note: "Asia + Western starter packs merged into Blob dataset.",
  })
}
