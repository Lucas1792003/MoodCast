import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

function pickFirst(addr: any, keys: string[]) {
  for (const k of keys) {
    const v = addr?.[k]
    if (typeof v === "string" && v.trim()) return v.trim()
  }
  return null
}

function cleanName(s: string) {
  return s
    .replace(/\bsubdistrict\b/gi, "")
    .replace(/\bdistrict\b/gi, "")
    .replace(/\bprovince\b/gi, "")
    .replace(/\bstate\b/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .trim()
}

function looksTooLocal(s: string) {
  const t = s.toLowerCase()
  return t.includes("subdistrict") || t.includes("village") || t.includes("neighbourhood")
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get("lat"))
  const lon = Number(searchParams.get("lon"))

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Invalid lat/lon" }, { status: 400 })
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`

  const res = await fetch(url, {
    headers: {
      "User-Agent": "MoodCast/1.0",
      "Accept-Language": "en",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    return NextResponse.json({ error: "Reverse geocode failed" }, { status: 502 })
  }

  const data: any = await res.json()
  const addr = data?.address ?? {}

  const country = cleanName(pickFirst(addr, ["country"]) || "")

  let city = pickFirst(addr, ["city", "town", "municipality", "village", "county", "state_district"]) || ""
  let region = pickFirst(addr, ["state", "region", "province"]) || ""

  city = cleanName(city)
  region = cleanName(region)

  if (!city || looksTooLocal(city)) {
    city = region || city
  }

  const query = [city, country].filter(Boolean).join(", ").trim() || "Thailand"
  const label = query 

  return NextResponse.json({ city, region, country, query, label })
}
