import { NextResponse } from "next/server"
import type { GeocodeResult } from "../../../lib/weather-types"


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()

  if (!q) {
    return NextResponse.json({ error: "Missing q" }, { status: 400 })
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    q
  )}&count=1&language=en&format=json`

  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 502 })
  }

  const data = await res.json()
  const r = data?.results?.[0]
  if (!r) {
    return NextResponse.json({ error: "No results" }, { status: 404 })
  }

  const result: GeocodeResult = {
    name: r.name,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
  }

  return NextResponse.json(result)
}
