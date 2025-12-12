"use client"

import React, { useEffect, useRef } from "react"

type LngLat = { lng: number; lat: number }

export default function ActivityMap({
  center,
  user,
  destination,
  routeGeojson,
}: {
  center: LngLat
  user?: LngLat
  destination?: LngLat
  routeGeojson?: GeoJSON.FeatureCollection | null
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)
  const destMarkerRef = useRef<any>(null)

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      if (!containerRef.current || mapRef.current) return

      const maplibregl = (await import("maplibre-gl")).default

      if (!isMounted) return

      // OpenFreeMap style URL (free public instance) :contentReference[oaicite:6]{index=6}
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [center.lng, center.lat],
        zoom: 13,
      })

      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right")
      mapRef.current = map
    })()

    return () => {
      isMounted = false
      try {
        mapRef.current?.remove?.()
      } catch {}
      mapRef.current = null
      userMarkerRef.current = null
      destMarkerRef.current = null
    }
  }, [center.lat, center.lng])

  // Update markers + route
  useEffect(() => {
    ;(async () => {
      const map = mapRef.current
      if (!map) return

      const maplibregl = (await import("maplibre-gl")).default

      // user marker
      if (user) {
        if (!userMarkerRef.current) {
          userMarkerRef.current = new maplibregl.Marker({ color: "#111" })
            .setLngLat([user.lng, user.lat])
            .addTo(map)
        } else {
          userMarkerRef.current.setLngLat([user.lng, user.lat])
        }
      }

      // destination marker
      if (destination) {
        if (!destMarkerRef.current) {
          destMarkerRef.current = new maplibregl.Marker({ color: "#2563eb" })
            .setLngLat([destination.lng, destination.lat])
            .addTo(map)
        } else {
          destMarkerRef.current.setLngLat([destination.lng, destination.lat])
        }
      }

      // route line
      const sourceId = "route-source"
      const layerId = "route-layer"

      if (routeGeojson) {
        if (map.getSource(sourceId)) {
          ;(map.getSource(sourceId) as any).setData(routeGeojson)
        } else {
          map.addSource(sourceId, { type: "geojson", data: routeGeojson as any })
          map.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-width": 5 },
          })
        }
      } else {
        // remove if present
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      }

      // fit bounds if we have both
      if (user && destination) {
        const bounds = new maplibregl.LngLatBounds()
        bounds.extend([user.lng, user.lat])
        bounds.extend([destination.lng, destination.lat])
        map.fitBounds(bounds, { padding: 60, maxZoom: 15 })
      }
    })()
  }, [user?.lat, user?.lng, destination?.lat, destination?.lng, routeGeojson])

  return (
    <div className="w-full h-[360px] rounded-3xl overflow-hidden border border-slate-200 bg-slate-50">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
