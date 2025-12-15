"use client"

import React, { useEffect, useMemo, useRef } from "react"
import { createRoot, type Root } from "react-dom/client"
import {
  CakeSlice,
  Coffee,
  Utensils,
  Trees,
  Landmark,
  ShoppingBag,
  Film,
  Dumbbell,
  Camera,
  Store,
  MapPin,
  Navigation2,
  UserRound,
  LocateFixed,
} from "lucide-react"

type LngLat = { lng: number; lat: number }

export type ActivityPlaceMarker = {
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
  distanceM?: number
  address?: string
}

const CATEGORY_COLOR: Record<ActivityPlaceMarker["category"], string> = {
  dessert: "#ec4899",
  cafe: "#a855f7",
  food: "#f97316",
  park: "#22c55e",
  museum: "#3b82f6",
  mall: "#a855f7",
  cinema: "#ef4444",
  gym: "#14b8a6",
  photo: "#f59e0b",
  market: "#84cc16",
  other: "#64748b",
}

function IconForCategory({ category }: { category: ActivityPlaceMarker["category"] }) {
  const common = { size: 18, strokeWidth: 2.2 }
  switch (category) {
    case "dessert":
      return <CakeSlice {...common} />
    case "cafe":
      return <Coffee {...common} />
    case "food":
      return <Utensils {...common} />
    case "park":
      return <Trees {...common} />
    case "museum":
      return <Landmark {...common} />
    case "mall":
      return <ShoppingBag {...common} />
    case "cinema":
      return <Film {...common} />
    case "gym":
      return <Dumbbell {...common} />
    case "photo":
      return <Camera {...common} />
    case "market":
      return <Store {...common} />
    default:
      return <MapPin {...common} />
  }
}

function safeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

type MarkerBundle = { marker: any; root: Root }

export default function ActivityMap({
  center,
  user,
  destination,
  routeGeojson,
  places = [],
  selectedPlaceId,
  onSelectPlace,
  className,
}: {
  center: LngLat
  user?: LngLat
  destination?: LngLat
  routeGeojson?: GeoJSON.FeatureCollection | null
  places?: ActivityPlaceMarker[]
  selectedPlaceId?: string
  onSelectPlace?: (placeId: string) => void
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)

  const userMarkerRef = useRef<any>(null)
  const userRootRef = useRef<Root | null>(null)

  const destMarkerRef = useRef<any>(null)
  const destRootRef = useRef<Root | null>(null)

  const placeMarkersRef = useRef<Map<string, MarkerBundle>>(new Map())
  const popupRef = useRef<any>(null)

  const userRef = useRef<LngLat | undefined>(user)
  useEffect(() => {
    userRef.current = user
  }, [user?.lat, user?.lng])

  const recenterCtrlRef = useRef<{ ctrl: any; root: Root | null } | null>(null)

  const normalizedPlaces = useMemo(() => {
    const m = new Map<string, ActivityPlaceMarker>()
    for (const p of places) m.set(p.id, p)
    return Array.from(m.values())
  }, [places])

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      if (!containerRef.current || mapRef.current) return

      const maplibregl = (await import("maplibre-gl")).default
      if (!isMounted) return

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [center.lng, center.lat],
        zoom: 13,
      })

      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right")

      // ✅ Recenter control (next to +/-)
      const ctrl: any = {
        onAdd: (m: any) => {
          const container = document.createElement("div")
          container.className = "maplibregl-ctrl maplibregl-ctrl-group mc-recenter-ctrl"

          const btn = document.createElement("button")
          btn.type = "button"
          btn.className = "mc-recenter-btn"
          btn.title = "Recenter to your location"
          btn.setAttribute("aria-label", "Recenter to your location")

          const iconWrap = document.createElement("div")
          iconWrap.className = "mc-recenter-icon"
          btn.appendChild(iconWrap)

          const root = createRoot(iconWrap)
          root.render(<LocateFixed size={18} strokeWidth={2.2} />)

          btn.addEventListener("click", () => {
            const u = userRef.current
            if (!u) return
            const z = m.getZoom?.() ?? 13
            m.flyTo({
              center: [u.lng, u.lat],
              zoom: Math.max(z, 14),
              essential: true,
              duration: 700,
            })
          })

          container.appendChild(btn)
          recenterCtrlRef.current = { ctrl, root }
          return container
        },
        onRemove: () => {},
      }

      map.addControl(ctrl, "top-right")
      mapRef.current = map
    })()

    return () => {
      isMounted = false

      try {
        popupRef.current?.remove?.()
      } catch {}
      popupRef.current = null

      for (const bundle of placeMarkersRef.current.values()) {
        try {
          bundle.root.unmount()
        } catch {}
        try {
          bundle.marker.remove?.()
        } catch {}
      }
      placeMarkersRef.current.clear()

      try {
        userRootRef.current?.unmount()
      } catch {}
      userRootRef.current = null
      try {
        userMarkerRef.current?.remove?.()
      } catch {}
      userMarkerRef.current = null

      try {
        destRootRef.current?.unmount()
      } catch {}
      destRootRef.current = null
      try {
        destMarkerRef.current?.remove?.()
      } catch {}
      destMarkerRef.current = null

      if (recenterCtrlRef.current?.root) {
        try {
          recenterCtrlRef.current.root.unmount()
        } catch {}
      }
      recenterCtrlRef.current = null

      try {
        mapRef.current?.remove?.()
      } catch {}
      mapRef.current = null
    }
  }, [center.lat, center.lng])

  useEffect(() => {
    ;(async () => {
      const map = mapRef.current
      if (!map) return

      const maplibregl = (await import("maplibre-gl")).default

      const ensureLoaded = async () => {
        if (map.loaded?.()) return
        await new Promise<void>((resolve) => map.once("load", () => resolve()))
      }

      await ensureLoaded()

      // USER marker
      if (user) {
        if (!userMarkerRef.current) {
          const el = document.createElement("div")
          el.className = "mc-user-marker"

          const pulse = document.createElement("div")
          pulse.className = "mc-user-pulse"
          el.appendChild(pulse)

          const iconWrap = document.createElement("div")
          iconWrap.className = "mc-user-icon"
          el.appendChild(iconWrap)

          const root = createRoot(iconWrap)
          root.render(<UserRound size={20} strokeWidth={2.2} />)
          userRootRef.current = root

          userMarkerRef.current = new maplibregl.Marker({ element: el, anchor: "bottom" })
            .setLngLat([user.lng, user.lat])
            .addTo(map)
        } else {
          userMarkerRef.current.setLngLat([user.lng, user.lat])
        }
      }

      // DEST marker
      if (destination) {
        if (!destMarkerRef.current) {
          const el = document.createElement("div")
          el.className = "mc-dest-marker"

          const iconWrap = document.createElement("div")
          iconWrap.className = "mc-dest-icon"
          el.appendChild(iconWrap)

          const root = createRoot(iconWrap)
          root.render(<Navigation2 size={18} strokeWidth={2.3} />)
          destRootRef.current = root

          destMarkerRef.current = new maplibregl.Marker({ element: el, anchor: "bottom" })
            .setLngLat([destination.lng, destination.lat])
            .addTo(map)
        } else {
          destMarkerRef.current.setLngLat([destination.lng, destination.lat])
        }
      }

      // PLACE markers
      const existing = placeMarkersRef.current
      const nextIds = new Set(normalizedPlaces.map((p) => p.id))

      for (const [id, bundle] of existing.entries()) {
        if (!nextIds.has(id)) {
          try {
            bundle.root.unmount()
          } catch {}
          try {
            bundle.marker.remove?.()
          } catch {}
          existing.delete(id)
        }
      }

      for (const p of normalizedPlaces) {
        const isSelected = p.id === selectedPlaceId
        const color = CATEGORY_COLOR[p.category] ?? CATEGORY_COLOR.other

        const prev = existing.get(p.id)
        if (prev) {
          prev.marker.setLngLat([p.lon, p.lat])
          const el = prev.marker.getElement?.() as HTMLElement | undefined
          if (el) {
            el.style.backgroundColor = color
            el.classList.toggle("is-selected", !!isSelected)
          }
          continue
        }

        const el = document.createElement("button")
        el.type = "button"
        el.className = "mc-place-marker"
        el.style.backgroundColor = color
        el.style.color = "#ffffff"
        if (isSelected) el.classList.add("is-selected")

        const iconWrap = document.createElement("div")
        iconWrap.className = "mc-place-icon"
        el.appendChild(iconWrap)

        const root = createRoot(iconWrap)
        root.render(<IconForCategory category={p.category} />)

        el.addEventListener("click", (ev) => {
          ev.preventDefault()
          ev.stopPropagation()
          onSelectPlace?.(p.id)

          try {
            popupRef.current?.remove?.()
          } catch {}

          const html = `
            <div style="min-width: 220px">
              <div style="font-weight: 700; margin-bottom: 4px">${safeHtml(p.name)}</div>
              <div style="font-size: 12px; opacity: 0.8">
                ${safeHtml(p.category)}${typeof p.distanceM === "number" ? ` · ~${Math.round(p.distanceM)}m` : ""}
              </div>
              ${p.address ? `<div style="font-size: 12px; margin-top: 6px">${safeHtml(p.address)}</div>` : ""}
            </div>
          `.trim()

          popupRef.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: true,
            offset: 18,
            maxWidth: "260px",
          })
            .setLngLat([p.lon, p.lat])
            .setHTML(html)
            .addTo(map)
        })

        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([p.lon, p.lat])
          .addTo(map)

        existing.set(p.id, { marker, root })
      }

      // ROUTE line (BLUE)
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
            paint: { "line-width": 5, "line-color": "#2563eb" },
          })
        }
      } else {
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      }

      // FIT bounds
      const bounds = new maplibregl.LngLatBounds()
      let hasAny = false

      if (user) {
        bounds.extend([user.lng, user.lat])
        hasAny = true
      }
      if (destination) {
        bounds.extend([destination.lng, destination.lat])
        hasAny = true
      }
      if (hasAny) map.fitBounds(bounds, { padding: 70, maxZoom: 15, duration: 900 })
    })()
  }, [
    user?.lat,
    user?.lng,
    destination?.lat,
    destination?.lng,
    routeGeojson,
    normalizedPlaces,
    selectedPlaceId,
    onSelectPlace,
  ])

  return (
    <div
      className={
        className ??
        "w-full h-[320px] sm:h-[380px] md:h-[420px] rounded-3xl overflow-hidden border border-slate-200 bg-slate-50"
      }
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
