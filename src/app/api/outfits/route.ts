import { NextResponse } from "next/server"

export const runtime = "nodejs"

type Gender = "male" | "female" | "unisex"
type Category = "head" | "outer" | "top" | "bottom" | "shoes" | "accessory"

export type OutfitCatalogItem = {
  id: string
  name: string
  category: Category
  gender: Gender
  // Fahrenheit
  minTempF?: number
  maxTempF?: number
  weather?: Array<"any" | "rain" | "snow" | "wind" | "clear" | "cloudy" | "storm">
  regions?: string[] // ["Tokyo","Japan","JP","global"]
  styleTags?: string[]
}

function asNum(v: string | null) {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function normalizeLocation(location: string) {
  const s = (location || "").trim()
  if (!s) return { tokens: ["global"] }

  const parts = s.split(",").map((x) => x.trim()).filter(Boolean)
  const city = parts[0] ?? ""
  const country = parts[1] ?? ""
  const tokens = [city, country, city.toLowerCase(), country.toLowerCase(), "global"].filter(Boolean)

  if (country.toLowerCase() === "japan") tokens.push("JP", "jp")
  if (city.toLowerCase() === "tokyo") tokens.push("Tokyo", "tokyo")
  return { tokens }
}

/**
 * Plug your real provider here.
 * Keep it server-side so API keys stay safe.
 */
async function fetchProviderCatalog(_opts: {
  location: string
  lat: number | null
  lon: number | null
  gender: Gender
  tempF: number | null
  weatherCode: number | null
}): Promise<OutfitCatalogItem[] | null> {
  const baseUrl = process.env.OUTFIT_API_URL
  if (!baseUrl) return null

  // Example (adjust to your provider):
  // const url = new URL(baseUrl)
  // url.searchParams.set("location", _opts.location)
  // url.searchParams.set("gender", _opts.gender)
  // if (_opts.tempF != null) url.searchParams.set("tempF", String(_opts.tempF))
  // if (_opts.weatherCode != null) url.searchParams.set("weatherCode", String(_opts.weatherCode))
  //
  // const r = await fetch(url.toString(), {
  //   headers: { Authorization: `Bearer ${process.env.OUTFIT_API_KEY ?? ""}` },
  //   cache: "no-store",
  // })
  // if (!r.ok) return null
  // const data = await r.json()
  // return normalizeProviderResponse(data)

  return null
}

/** Fallback catalog (still gendered + filterable like real data) */
function fallbackCatalog(location: string): OutfitCatalogItem[] {
  const { tokens } = normalizeLocation(location)
  const isTokyoish = tokens.includes("tokyo") || tokens.includes("Tokyo") || tokens.includes("jp") || tokens.includes("JP")

  return [
    // HEAD
    { id: "head-beanie", name: "Beanie", category: "head", gender: "unisex", maxTempF: 55, weather: ["any"], regions: ["global"] },
    { id: "head-cap", name: "Baseball cap", category: "head", gender: "unisex", minTempF: 60, weather: ["clear", "cloudy", "any"], regions: ["global"] },

    // OUTER
    { id: "outer-puffer", name: "Puffer jacket", category: "outer", gender: "unisex", maxTempF: 45, weather: ["any"], regions: ["global"] },
    { id: "outer-hoodie", name: isTokyoish ? "Streetwear hoodie" : "Hoodie", category: "outer", gender: "unisex", maxTempF: 65, weather: ["any"], regions: ["global"] },
    { id: "outer-denim-jacket", name: "Denim jacket", category: "outer", gender: "unisex", minTempF: 55, maxTempF: 75, weather: ["cloudy", "wind", "any"], regions: ["global"] },
    { id: "outer-rain-shell", name: "Rain shell", category: "outer", gender: "unisex", weather: ["rain", "storm"], regions: ["global"] },

    // TOP (gender-specific names!)
    { id: "top-thermal", name: "Thermal long-sleeve", category: "top", gender: "unisex", maxTempF: 45, weather: ["any"], regions: ["global"] },
    { id: "top-sweater", name: "Crewneck sweater", category: "top", gender: "unisex", maxTempF: 60, weather: ["any"], regions: ["global"] },
    { id: "top-tee", name: "T-shirt", category: "top", gender: "unisex", minTempF: 70, weather: ["clear", "cloudy", "any"], regions: ["global"] },

    { id: "top-male-oxford", name: "Oxford shirt", category: "top", gender: "male", minTempF: 55, maxTempF: 80, weather: ["any"], regions: ["global"] },
    { id: "top-male-linen", name: "Linen shirt", category: "top", gender: "male", minTempF: 75, weather: ["clear", "cloudy", "any"], regions: ["global"] },

    { id: "top-female-blouse", name: "Light blouse", category: "top", gender: "female", minTempF: 70, weather: ["clear", "cloudy", "any"], regions: ["global"] },
    { id: "top-female-knit", name: "Knit cardigan top", category: "top", gender: "female", maxTempF: 70, weather: ["any"], regions: ["global"] },

    // BOTTOM (gender-specific so male never sees skirt)
    { id: "bottom-jeans", name: "Jeans", category: "bottom", gender: "unisex", minTempF: 45, maxTempF: 75, weather: ["any"], regions: ["global"] },
    { id: "bottom-shorts", name: "Shorts", category: "bottom", gender: "unisex", minTempF: 80, weather: ["clear", "cloudy", "any"], regions: ["global"] },

    { id: "bottom-male-chinos", name: "Chinos", category: "bottom", gender: "male", minTempF: 55, maxTempF: 80, weather: ["any"], regions: ["global"] },
    { id: "bottom-male-trousers", name: "Straight-leg trousers", category: "bottom", gender: "male", minTempF: 45, maxTempF: 70, weather: ["any"], regions: ["global"] },

    { id: "bottom-female-midi-skirt", name: "Midi skirt", category: "bottom", gender: "female", minTempF: 55, maxTempF: 80, weather: ["any"], regions: ["global"] },
    { id: "bottom-female-wide-leg", name: "Wide-leg pants", category: "bottom", gender: "female", minTempF: 45, maxTempF: 75, weather: ["any"], regions: ["global"] },

    // SHOES
    { id: "shoes-waterproof", name: "Waterproof sneakers", category: "shoes", gender: "unisex", weather: ["rain", "storm", "any"], regions: ["global"] },
    { id: "shoes-sneakers", name: "Sneakers", category: "shoes", gender: "unisex", weather: ["clear", "cloudy", "any"], regions: ["global"] },
    { id: "shoes-boots", name: "Boots", category: "shoes", gender: "unisex", maxTempF: 55, weather: ["any"], regions: ["global"] },

    // ACCESSORY
    { id: "acc-scarf", name: "Scarf", category: "accessory", gender: "unisex", maxTempF: 50, weather: ["any"], regions: ["global"] },
    { id: "acc-umbrella", name: "Umbrella", category: "accessory", gender: "unisex", weather: ["rain", "storm"], regions: ["global"] },
    { id: "acc-sunglasses", name: "Sunglasses", category: "accessory", gender: "unisex", minTempF: 70, weather: ["clear", "any"], regions: ["global"] },
  ]
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const location = (searchParams.get("location") ?? "").trim()
  const gender = (searchParams.get("gender") ?? "unisex") as Gender
  const lat = asNum(searchParams.get("lat"))
  const lon = asNum(searchParams.get("lon"))
  const tempF = asNum(searchParams.get("tempF"))
  const weatherCode = asNum(searchParams.get("weatherCode"))

  const provider = await fetchProviderCatalog({ location, lat, lon, gender, tempF, weatherCode })
  const items = provider ?? fallbackCatalog(location)

  return NextResponse.json({
    items,
    meta: { location, gender, lat, lon, tempF, weatherCode },
  })
}
