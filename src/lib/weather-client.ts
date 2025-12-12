import type { GeocodeResult, WeatherResult } from "@/lib/weather-types"

export async function geocodeCity(q: string): Promise<GeocodeResult> {
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
  if (!res.ok) throw new Error("Geocode failed")
  return res.json()
}

export async function getWeather(lat: number, lon: number, name?: string): Promise<WeatherResult> {
  const qs = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  })
  if (name) qs.set("name", name)

  const res = await fetch(`/api/weather?${qs.toString()}`)
  if (!res.ok) throw new Error("Weather failed")
  return res.json()
}
