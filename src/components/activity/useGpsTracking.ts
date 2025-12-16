import { useState, useRef, useCallback } from "react"

type GpsState = {
  userPos: { lat: number; lng: number } | null
  gpsAccuracyM: number | null
  lastGpsAt: number | null
}

type UseGpsTrackingReturn = GpsState & {
  setUserPos: (pos: { lat: number; lng: number } | null) => void
  setGpsAccuracyM: (accuracy: number | null) => void
  setLastGpsAt: (time: number | null) => void
  startWatching: () => Promise<GeolocationPosition>
  stopWatching: () => void
  watchIdRef: React.MutableRefObject<number | null>
}

export function useGpsTracking(): UseGpsTrackingReturn {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsAccuracyM, setGpsAccuracyM] = useState<number | null>(null)
  const [lastGpsAt, setLastGpsAt] = useState<number | null>(null)

  const watchIdRef = useRef<number | null>(null)

  const stopWatching = useCallback(() => {
    if (watchIdRef.current != null) {
      try {
        navigator.geolocation.clearWatch(watchIdRef.current)
      } catch {}
      watchIdRef.current = null
    }
  }, [])

  const startWatching = useCallback(async (): Promise<GeolocationPosition> => {
    // Clear any existing watch
    stopWatching()

    // Get initial position
    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 12000,
      })
    )

    setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    setGpsAccuracyM(pos.coords.accuracy ?? null)
    setLastGpsAt(Date.now())

    // Start watching for updates
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (p) => {
          setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude })
          setGpsAccuracyM(p.coords.accuracy ?? null)
          setLastGpsAt(Date.now())
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      )
    } catch {}

    return pos
  }, [stopWatching])

  return {
    userPos,
    gpsAccuracyM,
    lastGpsAt,
    setUserPos,
    setGpsAccuracyM,
    setLastGpsAt,
    startWatching,
    stopWatching,
    watchIdRef,
  }
}
