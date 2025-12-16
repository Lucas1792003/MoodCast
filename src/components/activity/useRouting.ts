import { useState, useRef, useEffect, useCallback } from "react"
import { osrmProfile, haversineM } from "./utils"
import type { Mode, PlaceRef, TravelMeta } from "./types"

type RouteResult = {
  geojson: GeoJSON.FeatureCollection | null
  distanceM?: number
  durationS?: number
}

async function fetchRoute(
  userLat: number,
  userLon: number,
  destLat: number,
  destLon: number,
  m: Mode
): Promise<RouteResult> {
  const profile = osrmProfile(m)
  const url = `https://router.project-osrm.org/route/v1/${profile}/${userLon},${userLat};${destLon},${destLat}?overview=full&geometries=geojson`
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) throw new Error("route failed")
    const json = await res.json()
    const route = json?.routes?.[0]
    const coords = route?.geometry?.coordinates
    const geojson =
      Array.isArray(coords) && coords.length
        ? ({
            type: "FeatureCollection",
            features: [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords } }],
          } as GeoJSON.FeatureCollection)
        : null
    return {
      geojson,
      distanceM: route?.distance as number | undefined,
      durationS: route?.duration as number | undefined,
    }
  } catch {
    if (m !== "drive") return fetchRoute(userLat, userLon, destLat, destLon, "drive")
    return { geojson: null, distanceM: undefined, durationS: undefined }
  }
}

async function fetchTableForPlaces(
  userLat: number,
  userLon: number,
  places: PlaceRef[],
  m: Mode
): Promise<Record<string, TravelMeta>> {
  if (!places.length) return {}
  const profile = osrmProfile(m)
  const coords = [`${userLon},${userLat}`, ...places.map((p) => `${p.lon},${p.lat}`)].join(";")
  const url = `https://router.project-osrm.org/table/v1/${profile}/${coords}?sources=0&annotations=duration,distance`
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) throw new Error("table failed")
    const json = await res.json()
    const durations: number[][] | undefined = json?.durations
    const distances: number[][] | undefined = json?.distances

    const next: Record<string, TravelMeta> = {}
    for (let i = 0; i < places.length; i++) {
      const idx = i + 1
      const dur = Array.isArray(durations?.[0]) ? durations![0][idx] : undefined
      const dist = Array.isArray(distances?.[0]) ? distances![0][idx] : undefined
      next[places[i].id] = {
        durationS: Number.isFinite(dur) ? dur : undefined,
        distanceM: Number.isFinite(dist) ? dist : undefined,
      }
    }
    return next
  } catch {
    if (m !== "drive") return fetchTableForPlaces(userLat, userLon, places, "drive")
    return {}
  }
}

type UseRoutingProps = {
  userPos: { lat: number; lng: number } | null
  selectedPlace: PlaceRef | null
  allPlaces: PlaceRef[]
  mode: Mode
  now: number
  hasData: boolean
}

type UseRoutingReturn = {
  routeGeojson: GeoJSON.FeatureCollection | null
  travelById: Record<string, TravelMeta>
  setRouteGeojson: (geojson: GeoJSON.FeatureCollection | null) => void
  setTravelById: React.Dispatch<React.SetStateAction<Record<string, TravelMeta>>>
  resetRouting: () => void
}

export function useRouting({
  userPos,
  selectedPlace,
  allPlaces,
  mode,
  now,
  hasData,
}: UseRoutingProps): UseRoutingReturn {
  const [routeGeojson, setRouteGeojson] = useState<GeoJSON.FeatureCollection | null>(null)
  const [travelById, setTravelById] = useState<Record<string, TravelMeta>>({})

  const lastRerouteRef = useRef<{ at: number; lat: number; lon: number; destId: string; mode: Mode } | null>(null)
  const lastTableRef = useRef<{ at: number; lat: number; lon: number; mode: Mode } | null>(null)

  const resetRouting = useCallback(() => {
    setRouteGeojson(null)
    setTravelById({})
    lastRerouteRef.current = null
    lastTableRef.current = null
  }, [])

  // Route to selected place
  useEffect(() => {
    const u = userPos
    const d = selectedPlace
    if (!u || !d) {
      setRouteGeojson(null)
      return
    }

    const last = lastRerouteRef.current
    const movedM = last ? haversineM(last.lat, last.lon, u.lat, u.lng) : Number.POSITIVE_INFINITY
    const shouldReroute = !last || last.destId !== d.id || last.mode !== mode || now - last.at > 10_000 || movedM > 25
    if (!shouldReroute) return

    lastRerouteRef.current = { at: now, lat: u.lat, lon: u.lng, destId: d.id, mode }

    void (async () => {
      const r = await fetchRoute(u.lat, u.lng, d.lat, d.lon, mode)
      setRouteGeojson(r.geojson ?? null)
      setTravelById((prev) => ({
        ...prev,
        [d.id]: { distanceM: r.distanceM ?? prev[d.id]?.distanceM, durationS: r.durationS ?? prev[d.id]?.durationS },
      }))
    })()
  }, [userPos?.lat, userPos?.lng, selectedPlace?.id, selectedPlace?.lat, selectedPlace?.lon, mode, now])

  // Table for all places
  useEffect(() => {
    const u = userPos
    if (!u || !hasData || !allPlaces.length) return

    const last = lastTableRef.current
    const movedM = last ? haversineM(last.lat, last.lon, u.lat, u.lng) : Number.POSITIVE_INFINITY
    const should = !last || last.mode !== mode || now - last.at > 15_000 || movedM > 40
    if (!should) return

    lastTableRef.current = { at: now, lat: u.lat, lon: u.lng, mode }
    void (async () => {
      const result = await fetchTableForPlaces(u.lat, u.lng, allPlaces, mode)
      setTravelById(result)
    })()
  }, [userPos?.lat, userPos?.lng, hasData, allPlaces.length, mode, now])

  return {
    routeGeojson,
    travelById,
    setRouteGeojson,
    setTravelById,
    resetRouting,
  }
}
