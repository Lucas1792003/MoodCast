import { useState, useEffect, useRef, useCallback } from "react"

type UseCompassHeadingProps = {
  enabled: boolean
}

type UseCompassHeadingReturn = {
  heading: number | null // degrees from north (0-360)
  isSupported: boolean
  error: string | null
  requestPermission: () => Promise<boolean>
}

/**
 * Hook to get device compass heading using DeviceOrientationEvent
 * Returns heading in degrees (0 = north, 90 = east, 180 = south, 270 = west)
 */
export function useCompassHeading({ enabled }: UseCompassHeadingProps): UseCompassHeadingReturn {
  const [heading, setHeading] = useState<number | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissionGranted, setPermissionGranted] = useState(false)

  const lastHeadingRef = useRef<number | null>(null)

  // Smooth heading transitions to avoid jitter
  const smoothHeading = useCallback((newHeading: number) => {
    const last = lastHeadingRef.current
    if (last === null) {
      lastHeadingRef.current = newHeading
      return newHeading
    }

    // Calculate shortest rotation direction
    let diff = newHeading - last
    if (diff > 180) diff -= 360
    if (diff < -180) diff += 360

    // Apply smoothing factor (0.3 = 30% new value, 70% old value)
    const smoothed = last + diff * 0.3

    // Normalize to 0-360
    const normalized = ((smoothed % 360) + 360) % 360
    lastHeadingRef.current = normalized
    return normalized
  }, [])

  // Request permission for iOS 13+
  const requestPermission = useCallback(async (): Promise<boolean> => {
    // Check if DeviceOrientationEvent exists
    if (typeof DeviceOrientationEvent === "undefined") {
      setIsSupported(false)
      setError("Device orientation not supported")
      return false
    }

    // iOS 13+ requires permission request
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        if (permission === "granted") {
          setPermissionGranted(true)
          setError(null)
          return true
        } else {
          setError("Compass permission denied")
          return false
        }
      } catch (e) {
        setError("Failed to request compass permission")
        return false
      }
    }

    // Non-iOS or older iOS - no permission needed
    setPermissionGranted(true)
    return true
  }, [])

  useEffect(() => {
    if (!enabled) {
      setHeading(null)
      lastHeadingRef.current = null
      return
    }

    // Check support
    if (typeof window === "undefined" || typeof DeviceOrientationEvent === "undefined") {
      setIsSupported(false)
      return
    }

    // If permission not granted and iOS requires it, don't listen yet
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === "function" &&
      !permissionGranted
    ) {
      return
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // webkitCompassHeading is iOS-specific (degrees from north)
      // alpha is standard but varies by device/browser
      let compassHeading: number | null = null

      if ("webkitCompassHeading" in event && typeof (event as any).webkitCompassHeading === "number") {
        // iOS: webkitCompassHeading is degrees from north
        compassHeading = (event as any).webkitCompassHeading
      } else if (event.alpha !== null) {
        // Android/other: alpha is rotation around z-axis
        // Need to convert based on screen orientation
        const alpha = event.alpha

        // Get screen orientation
        const screenOrientation = (window.screen.orientation?.angle || 0)

        // Convert alpha to compass heading
        // alpha: 0 = north for most Android devices when in portrait
        compassHeading = (360 - alpha + screenOrientation) % 360
      }

      if (compassHeading !== null && Number.isFinite(compassHeading)) {
        const smoothed = smoothHeading(compassHeading)
        setHeading(smoothed)
        setError(null)
      }
    }

    window.addEventListener("deviceorientation", handleOrientation, true)

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true)
    }
  }, [enabled, permissionGranted, smoothHeading])

  // Auto-request permission when enabled changes to true
  useEffect(() => {
    if (enabled && !permissionGranted && isSupported) {
      // Only auto-request if it doesn't require user gesture (non-iOS)
      if (typeof (DeviceOrientationEvent as any).requestPermission !== "function") {
        setPermissionGranted(true)
      }
    }
  }, [enabled, permissionGranted, isSupported])

  return {
    heading,
    isSupported,
    error,
    requestPermission,
  }
}
