import { NextResponse } from "next/server"
import type { GeocodeResult } from "../../../lib/weather-types"

export const runtime = "nodejs"

function cleanQuery(q: string) {
  return q
    .replace(/\bsubdistrict\b/gi, "")
    .replace(/\bdistrict\b/gi, "")
    .replace(/\bprovince\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
}

async function openMeteoGeocode(q: string) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    q
  )}&count=1&language=en&format=json`

  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) return null

  const data = await res.json()
  const r = data?.results?.[0]
  if (!r) return null

  const result: GeocodeResult = {
    name: r.name,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
  }
  return result
}

async function nominatimGeocode(q: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(
    q
  )}`

  const res = await fetch(url, {
    headers: {
      "User-Agent": "MoodCast/1.0",
      "Accept-Language": "en",
    },
    cache: "no-store",
  })
  if (!res.ok) return null

  const data: any[] = await res.json()
  const r = data?.[0]
  if (!r) return null

  const lat = Number(r.lat)
  const lon = Number(r.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

  const addr = r.address ?? {}
  const name =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.county ||
    addr.state ||
    r.name ||
    "Unknown"

  const result: GeocodeResult = {
    name,
    country: addr.country,
    latitude: lat,
    longitude: lon,
  }
  return result
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const qRaw = searchParams.get("q")?.trim()

  if (!qRaw) {
    return NextResponse.json({ error: "Missing q" }, { status: 400 })
  }

  let result = await openMeteoGeocode(qRaw)

  if (!result) {
    const cleaned = cleanQuery(qRaw)
    if (cleaned && cleaned !== qRaw) {
      result = await openMeteoGeocode(cleaned)
    }
  }

  if (!result) {
    result = await nominatimGeocode(qRaw)
  }

  if (!result) {
    return NextResponse.json({ error: "No results" }, { status: 404 })
  }

  return NextResponse.json(result)
}
