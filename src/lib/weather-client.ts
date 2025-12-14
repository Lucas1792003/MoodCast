import type { GeocodeResult, WeatherResult } from "@/lib/weather-types"

const FETCH_TIMEOUT_MS = 8000

async function fetchJson<T>(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return res.json() as Promise<T>
  } finally {
    clearTimeout(t)
  }
}

export async function geocodeCity(q: string): Promise<GeocodeResult> {
  
  const url = `/api/geocode?q=${encodeURIComponent(q)}`
  return fetchJson<GeocodeResult>(url)
}

export async function getWeather(
  lat: number,
  lon: number,
  name?: string
): Promise<WeatherResult> {
  const qs = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  })
  if (name) qs.set("name", name)

  const url = `/api/weather?${qs.toString()}`
  return fetchJson<WeatherResult>(url)
}
