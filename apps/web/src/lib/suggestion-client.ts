type WeatherInput = {
  code: number
  isDay: boolean
  temp: number
}

type Place = {
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

type Suggestion = {
  headline: string
  message: string
  place?: Pick<
    Place,
    "id" | "name" | "category" | "lat" | "lon" | "distanceM" | "address" | "osmUrl"
  >
}

export type ApiOut = {
  weatherUsed: WeatherInput
  kind: string
  primary: Suggestion
  secondary: Suggestion[]
}

type CacheEntry<T> = { expires: number; value: T }
const cache = new Map<string, CacheEntry<any>>()

function pickOne<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickRandom<T>(arr: T[]) {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null
}

const INDOOR_IDEAS: Suggestion[] = [
  {
    headline: "Cozy reading time",
    message: "It's rainy outside — perfect time to read 20–30 mins with a warm drink ☕📖",
  },
  {
    headline: "Board games with friends",
    message: "Rainy vibes = board game vibes. Invite a friend over (or play online) 🎲",
  },
  {
    headline: "Movie night",
    message: "Storm outside? Stay in and do a movie + snack combo 🍿",
  },
  {
    headline: "Home workout",
    message: "Try a quick 10–15 min stretch or bodyweight workout. Easy win 💪",
  },
  {
    headline: "Cook something warm",
    message: "Rain day cooking hits different. Make something warm + comforting 🍜",
  },
]

function indoorPrimary(kind: string): Suggestion {
  if (kind === "storm") return INDOOR_IDEAS[2]
  if (kind === "rain" || kind === "drizzle") {
    return pickOne([INDOOR_IDEAS[0], INDOOR_IDEAS[1], INDOOR_IDEAS[4]])
  }
  return pickOne(INDOOR_IDEAS)
}

function indoorSecondary(count: number, excludeHeadline?: string) {
  const pool = INDOOR_IDEAS.filter((x) => x.headline !== excludeHeadline)
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function getCache<T>(key: string): T | null {
  const hit = cache.get(key)
  if (!hit) return null
  if (Date.now() > hit.expires) {
    cache.delete(key)
    return null
  }
  return hit.value as T
}

function setCache<T>(key: string, value: T, ttlMs: number) {
  cache.set(key, { value, expires: Date.now() + ttlMs })
}

function toRad(d: number) {
  return (d * Math.PI) / 180
}

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function classifyWeather(code: number) {
  if (code === 0) return "clear"
  if (code === 1 || code === 2) return "partly"
  if (code === 3) return "cloudy"
  if (code === 45 || code === 48) return "fog"
  if ([51, 53, 55, 56, 57].includes(code)) return "drizzle"
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain"
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow"
  if ([95, 96, 99].includes(code)) return "storm"
  return "unknown"
}

function buildOverpassQuery(lat: number, lon: number, radiusM: number) {
  return `
[out:json][timeout:25];
(
  nwr(around:${radiusM},${lat},${lon})["amenity"~"cafe|ice_cream|restaurant|fast_food"];
  nwr(around:${radiusM},${lat},${lon})["shop"="bakery"];
  nwr(around:${radiusM},${lat},${lon})["leisure"~"park|garden"];
  nwr(around:${radiusM},${lat},${lon})["natural"="peak"];
  nwr(around:${radiusM},${lat},${lon})["tourism"~"museum|gallery|attraction|viewpoint"];
  nwr(around:${radiusM},${lat},${lon})["shop"="mall"];
  nwr(around:${radiusM},${lat},${lon})["amenity"~"cinema|theatre"];
  nwr(around:${radiusM},${lat},${lon})["amenity"="marketplace"];
  nwr(around:${radiusM},${lat},${lon})["leisure"~"fitness_centre|sports_centre"];
);
out center tags;
`
}

async function fetchOverpass(lat: number, lon: number, radiusM: number) {
  const key = `overpass:${lat.toFixed(3)}:${lon.toFixed(3)}:${radiusM}`
  const cached = getCache<any>(key)
  if (cached) return cached

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: buildOverpassQuery(lat, lon, radiusM),
  })

  if (!res.ok) throw new Error(`Overpass error ${res.status}`)
  const json = await res.json()

  setCache(key, json, 8 * 60 * 1000)
  return json
}

function toCategory(tags: Record<string, string | undefined>): Place["category"] {
  const amenity = tags.amenity
  const shop = tags.shop
  const tourism = tags.tourism
  const leisure = tags.leisure

  if (amenity === "ice_cream" || shop === "bakery") return "dessert"
  if (amenity === "cafe") return "cafe"
  if (amenity === "restaurant" || amenity === "fast_food") return "food"
  if (shop === "mall") return "mall"
  if (amenity === "cinema" || amenity === "theatre") return "cinema"
  if (amenity === "marketplace") return "market"
  if (leisure === "park" || leisure === "garden") return "park"
  if (leisure === "fitness_centre" || leisure === "sports_centre") return "gym"
  if (tourism === "museum" || tourism === "gallery") return "museum"
  if (tourism === "viewpoint" || tourism === "attraction") return "photo"
  return "other"
}

function elementToPlace(el: any, userLat: number, userLon: number): Place | null {
  const tags = el.tags || {}
  const name = tags.name || tags["name:en"]
  const lat = typeof el.lat === "number" ? el.lat : el.center?.lat
  const lon = typeof el.lon === "number" ? el.lon : el.center?.lon
  if (!name || typeof lat !== "number" || typeof lon !== "number") return null

  const category = toCategory(tags)
  const distanceM = haversineM(userLat, userLon, lat, lon)
  const osmUrl = el?.type && el?.id ? `https://www.openstreetmap.org/${el.type}/${el.id}` : undefined

  const addressParts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:subdistrict"],
    tags["addr:district"],
    tags["addr:city"],
  ].filter(Boolean)
  const address = addressParts.length ? addressParts.join(" ") : undefined

  return { id: `${el.type}/${el.id}`, name, category, lat, lon, distanceM, address, osmUrl }
}

function allowedCategories(kind: string, w: WeatherInput) {
  const hot = w.temp >= 32

  if (kind === "storm") {
    return new Set<Place["category"]>(["mall", "cafe", "dessert", "museum", "cinema", "gym", "food", "market"])
  }
  if (kind === "rain" || kind === "drizzle") {
    return new Set<Place["category"]>(["mall", "cafe", "dessert", "museum", "cinema", "gym", "food", "market"])
  }
  if (!w.isDay) {
    return new Set<Place["category"]>(["cafe", "dessert", "mall", "cinema", "food", "market", "photo"])
  }
  if (hot) {
    return new Set<Place["category"]>(["dessert", "mall", "cafe", "museum", "cinema", "food", "gym", "market"])
  }
  if (kind === "cloudy" || kind === "fog") {
    return new Set<Place["category"]>(["cafe", "food", "park", "museum", "photo", "mall", "dessert", "market"])
  }
  return new Set<Place["category"]>(["park", "photo", "cafe", "dessert", "food", "market", "museum"])
}

function vibeCopy(kind: string, w: WeatherInput, place?: Place): Suggestion {
  const hot = w.temp >= 32

  const fallback: Suggestion = {
    headline: "Today's vibe",
    message:
      kind === "rain" || kind === "storm"
        ? "It's wet outside — go for something cozy indoors. A cafe + a small treat sounds perfect."
        : hot
          ? "It's hot outside — pick something cool and easy. Dessert or an AC spot is a win."
          : "Looks like a nice day — go do something simple nearby and enjoy it.",
  }

  if (!place) return fallback

  const name = place.name
  const cat = place.category

  const placeLine = (msg: string): Suggestion => ({
    headline:
      kind === "rain" || kind === "storm"
        ? "Rainy-day plan"
        : hot
          ? "Hot-day plan"
          : w.isDay
            ? "Daytime plan"
            : "Night plan",
    message: msg,
    place: {
      id: place.id,
      name: place.name,
      category: place.category,
      lat: place.lat,
      lon: place.lon,
      distanceM: place.distanceM,
      address: place.address,
      osmUrl: place.osmUrl,
    },
  })

  if (hot && (cat === "dessert" || cat === "cafe")) {
    return placeLine(`Hey, it's hot outside — why not cool down at **${name}**? Grab something sweet + hydrate.`)
  }
  if ((kind === "rain" || kind === "storm") && (cat === "mall" || cat === "museum" || cat === "cinema")) {
    return placeLine(`Rain vibes today — stay dry and comfy. **${name}** nearby could be a perfect indoor plan.`)
  }
  if ((kind === "rain" || kind === "drizzle") && (cat === "cafe" || cat === "dessert")) {
    return placeLine(`It's rainy outside — cozy mode. Try **${name}** nearby for a warm drink + a small treat.`)
  }
  if (w.isDay && (cat === "park" || cat === "photo")) {
    return placeLine(`The weather looks friendly — how about heading to **${name}** for a short walk and a few nice photos?`)
  }
  if (!w.isDay && (cat === "market" || cat === "food" || cat === "cafe")) {
    return placeLine(`Night time = snack time 😄 **${name}** is nearby — go grab something and take it slow.`)
  }
  return placeLine(`Here's a nearby idea: **${name}**. Keep it simple — go for 30–60 minutes and enjoy the vibe.`)
}

function toSecondary(place: Place): Suggestion {
  return {
    headline: place.name,
    message: `${place.category} · ~${Math.round(place.distanceM)}m away`,
    place: {
      id: place.id,
      name: place.name,
      category: place.category,
      lat: place.lat,
      lon: place.lon,
      distanceM: place.distanceM,
      address: place.address,
      osmUrl: place.osmUrl,
    },
  }
}

export async function fetchSuggestionsClient(
  lat: number,
  lon: number,
  code: number,
  isDay: boolean,
  temp: number
): Promise<ApiOut> {
  const weatherUsed: WeatherInput = { code, isDay, temp }
  const kind = classifyWeather(code)
  const radiusM = 2000

  let elements: any[] = []
  try {
    const overpass = await fetchOverpass(lat, lon, radiusM)
    elements = Array.isArray(overpass?.elements) ? overpass.elements : []
  } catch {
    elements = []
  }

  const all = elements
    .map((el) => elementToPlace(el, lat, lon))
    .filter(Boolean) as Place[]

  const dedup = new Map<string, Place>()
  for (const p of all) {
    const key = `${p.name.toLowerCase()}::${p.category}`
    const prev = dedup.get(key)
    if (!prev || p.distanceM < prev.distanceM) dedup.set(key, p)
  }

  const pool = Array.from(dedup.values()).sort((a, b) => a.distanceM - b.distanceM)
  const allowed = allowedCategories(kind, weatherUsed)
  const filtered = pool.filter((p) => allowed.has(p.category)).slice(0, 80)

  const badWeather = kind === "storm" || kind === "rain" || kind === "drizzle"
  const preferIndoorPrimary = badWeather && Math.random() < 0.7

  let primary: Suggestion
  let secondary: Suggestion[] = []

  try {
    const candidates = (filtered.length ? filtered : pool).slice(0, 30)
    const chosen = pickRandom(candidates)

    if (preferIndoorPrimary) {
      const indoorPool = (filtered.length ? filtered : pool)
        .filter((p) =>
          ["mall", "cafe", "dessert", "museum", "cinema", "gym", "food", "market"].includes(p.category)
        )
        .slice(0, 40)

      const primaryPlace = pickRandom(indoorPool.slice(0, 20)) ?? (chosen ?? undefined)
      primary = primaryPlace ? vibeCopy(kind, weatherUsed, primaryPlace) : indoorPrimary(kind)

      const nearbyIndoor = indoorPool
        .filter((p) => (primaryPlace ? p.id !== primaryPlace.id : true))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(toSecondary)

      const extraIndoor = indoorSecondary(2, primary.headline)
      secondary = [...nearbyIndoor, ...extraIndoor].slice(0, 4)
    } else {
      primary = vibeCopy(kind, weatherUsed, chosen ?? undefined)

      const secondaryPlaces = (filtered.length ? filtered : pool)
        .filter((p) => (chosen ? p.id !== chosen.id : true))
        .slice(0, 30)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
        .map(toSecondary)

      const backupIndoor = badWeather ? indoorSecondary(1, undefined) : []
      secondary = [...secondaryPlaces, ...backupIndoor].slice(0, 4)
    }
  } catch {
    primary = indoorPrimary(kind)
    secondary = indoorSecondary(4, primary.headline)
  }

  return { weatherUsed, kind, primary, secondary }
}
