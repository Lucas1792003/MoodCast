import { NextResponse } from "next/server"
import type { WeatherResult } from "@/lib/weather-types"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const lat = Number(searchParams.get("lat"))
  const lon = Number(searchParams.get("lon"))
  const locationName = searchParams.get("name") ?? ""

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Invalid lat/lon" }, { status: 400 })
  }

  // NOTE: Open-Meteo needs no key.
    const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility,is_day` +
    `&daily=sunrise,sunset&forecast_days=1` +
    `&timezone=auto` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph`


  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) {
    return NextResponse.json({ error: "Weather fetch failed" }, { status: 502 })
  }

  const data = await res.json()
  const c = data?.current
  if (!c) {
    return NextResponse.json({ error: "Missing current weather" }, { status: 502 })
  }

  const out: WeatherResult = {
    locationName,
    temperature: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    weatherCode: c.weather_code,
    windSpeed: c.wind_speed_10m,
    humidity: c.relative_humidity_2m,
    visibility: c.visibility,
    latitude: lat,
    longitude: lon,
    isDay: Boolean(c.is_day),
    sunrise: data?.daily?.sunrise?.[0] ?? null,
    sunset: data?.daily?.sunset?.[0] ?? null,
    }


  return NextResponse.json(out)
}
