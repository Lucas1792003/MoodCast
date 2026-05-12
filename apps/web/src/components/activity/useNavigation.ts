import { useState, useCallback, useRef, useEffect } from "react"
import { osrmProfile, haversineM } from "./utils"
import type { Mode } from "./types"

export type NavigationStep = {
  instruction: string
  distance: number // meters
  duration: number // seconds
  maneuver: {
    type: string
    modifier?: string
    bearing_after?: number
    bearing_before?: number
    location: [number, number] // [lng, lat]
  }
  name: string // road name
}

export type NavigationState = {
  isNavigating: boolean
  steps: NavigationStep[]
  currentStepIndex: number
  totalDistanceM: number
  totalDurationS: number
  remainingDistanceM: number
  remainingDurationS: number
  distanceToNextStepM: number
  arrivalTime: Date | null
}

type UseNavigationProps = {
  userPos: { lat: number; lng: number } | null
  destination: { lat: number; lon: number } | null
  mode: Mode
  onArrival?: () => void
}

const STEP_ADVANCE_THRESHOLD_M = 30 // Advance to next step when within 30m
const ARRIVAL_THRESHOLD_M = 50 // Consider arrived when within 50m of destination

// Format OSRM instruction to human-readable text
function formatInstruction(step: any): string {
  const maneuver = step.maneuver
  const type = maneuver?.type || ""
  const modifier = maneuver?.modifier || ""
  const name = step.name || "the road"

  switch (type) {
    case "depart":
      return `Head ${modifier || "forward"} on ${name}`
    case "arrive":
      return modifier === "left"
        ? "Arrive at your destination on the left"
        : modifier === "right"
          ? "Arrive at your destination on the right"
          : "You have arrived at your destination"
    case "turn":
      return `Turn ${modifier} onto ${name}`
    case "continue":
      return `Continue ${modifier ? modifier + " " : ""}on ${name}`
    case "merge":
      return `Merge ${modifier} onto ${name}`
    case "fork":
      return `Take the ${modifier} fork onto ${name}`
    case "roundabout":
    case "rotary":
      return `Enter the roundabout and take the exit onto ${name}`
    case "exit roundabout":
    case "exit rotary":
      return `Exit the roundabout onto ${name}`
    case "ramp":
      return `Take the ramp ${modifier} onto ${name}`
    case "on ramp":
      return `Take the on-ramp onto ${name}`
    case "off ramp":
      return `Take the off-ramp onto ${name}`
    case "end of road":
      return `At the end of the road, turn ${modifier} onto ${name}`
    case "new name":
      return `Continue onto ${name}`
    case "notification":
      return step.instruction || `Continue on ${name}`
    default:
      if (modifier) {
        return `${modifier.charAt(0).toUpperCase() + modifier.slice(1)} onto ${name}`
      }
      return `Continue on ${name}`
  }
}

// Get maneuver icon name based on type and modifier
export function getManeuverIcon(
  type: string,
  modifier?: string
): "straight" | "left" | "right" | "slight-left" | "slight-right" | "sharp-left" | "sharp-right" | "uturn" | "roundabout" | "arrive" | "depart" {
  if (type === "arrive") return "arrive"
  if (type === "depart") return "depart"
  if (type === "roundabout" || type === "rotary") return "roundabout"

  switch (modifier) {
    case "left":
      return "left"
    case "right":
      return "right"
    case "slight left":
      return "slight-left"
    case "slight right":
      return "slight-right"
    case "sharp left":
      return "sharp-left"
    case "sharp right":
      return "sharp-right"
    case "uturn":
      return "uturn"
    case "straight":
    default:
      return "straight"
  }
}

async function fetchRouteWithSteps(
  userLat: number,
  userLon: number,
  destLat: number,
  destLon: number,
  mode: Mode
): Promise<{
  steps: NavigationStep[]
  totalDistanceM: number
  totalDurationS: number
  geometry: GeoJSON.LineString | null
} | null> {
  const profile = osrmProfile(mode)
  const url = `https://router.project-osrm.org/route/v1/${profile}/${userLon},${userLat};${destLon},${destLat}?overview=full&geometries=geojson&steps=true`

  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) throw new Error("route failed")
    const json = await res.json()
    const route = json?.routes?.[0]
    if (!route) return null

    const legs = route.legs || []
    const steps: NavigationStep[] = []

    for (const leg of legs) {
      for (const step of leg.steps || []) {
        steps.push({
          instruction: formatInstruction(step),
          distance: step.distance || 0,
          duration: step.duration || 0,
          maneuver: {
            type: step.maneuver?.type || "continue",
            modifier: step.maneuver?.modifier,
            bearing_after: step.maneuver?.bearing_after,
            bearing_before: step.maneuver?.bearing_before,
            location: step.maneuver?.location || [userLon, userLat],
          },
          name: step.name || "",
        })
      }
    }

    return {
      steps,
      totalDistanceM: route.distance || 0,
      totalDurationS: route.duration || 0,
      geometry: route.geometry || null,
    }
  } catch (e) {
    console.error("Failed to fetch route with steps:", e)
    return null
  }
}

export function useNavigation({
  userPos,
  destination,
  mode,
  onArrival,
}: UseNavigationProps) {
  const [state, setState] = useState<NavigationState>({
    isNavigating: false,
    steps: [],
    currentStepIndex: 0,
    totalDistanceM: 0,
    totalDurationS: 0,
    remainingDistanceM: 0,
    remainingDurationS: 0,
    distanceToNextStepM: 0,
    arrivalTime: null,
  })

  const [routeGeometry, setRouteGeometry] = useState<GeoJSON.FeatureCollection | null>(null)
  const lastRerouteRef = useRef<{ lat: number; lng: number; at: number } | null>(null)
  const gpsWatchIdRef = useRef<number | null>(null)

  // Start navigation
  const startNavigation = useCallback(async () => {
    if (!userPos || !destination) return

    const result = await fetchRouteWithSteps(
      userPos.lat,
      userPos.lng,
      destination.lat,
      destination.lon,
      mode
    )

    if (!result || result.steps.length === 0) {
      console.error("No route found")
      return
    }

    const arrivalTime = new Date(Date.now() + result.totalDurationS * 1000)

    // Calculate distance to first step
    const firstStep = result.steps[0]
    const distToFirst = firstStep
      ? haversineM(userPos.lat, userPos.lng, firstStep.maneuver.location[1], firstStep.maneuver.location[0])
      : 0

    setState({
      isNavigating: true,
      steps: result.steps,
      currentStepIndex: 0,
      totalDistanceM: result.totalDistanceM,
      totalDurationS: result.totalDurationS,
      remainingDistanceM: result.totalDistanceM,
      remainingDurationS: result.totalDurationS,
      distanceToNextStepM: distToFirst,
      arrivalTime,
    })

    if (result.geometry) {
      setRouteGeometry({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: result.geometry,
          },
        ],
      })
    }

    lastRerouteRef.current = { lat: userPos.lat, lng: userPos.lng, at: Date.now() }
  }, [userPos, destination, mode])

  // Stop navigation
  const stopNavigation = useCallback(() => {
    setState({
      isNavigating: false,
      steps: [],
      currentStepIndex: 0,
      totalDistanceM: 0,
      totalDurationS: 0,
      remainingDistanceM: 0,
      remainingDurationS: 0,
      distanceToNextStepM: 0,
      arrivalTime: null,
    })
    setRouteGeometry(null)
    lastRerouteRef.current = null

    if (gpsWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current)
      gpsWatchIdRef.current = null
    }
  }, [])

  // Update navigation state when user position changes
  useEffect(() => {
    if (!state.isNavigating || !userPos || !destination) return

    const { steps, currentStepIndex } = state

    // Check if arrived at destination
    const distToDest = haversineM(userPos.lat, userPos.lng, destination.lat, destination.lon)
    if (distToDest < ARRIVAL_THRESHOLD_M) {
      stopNavigation()
      onArrival?.()
      return
    }

    // Check if we should advance to next step
    let newStepIndex = currentStepIndex
    for (let i = currentStepIndex; i < steps.length - 1; i++) {
      const nextStep = steps[i + 1]
      if (!nextStep) break

      const distToNext = haversineM(
        userPos.lat,
        userPos.lng,
        nextStep.maneuver.location[1],
        nextStep.maneuver.location[0]
      )

      if (distToNext < STEP_ADVANCE_THRESHOLD_M) {
        newStepIndex = i + 1
      } else {
        break
      }
    }

    // Calculate remaining distance (sum of remaining steps)
    let remainingDist = 0
    let remainingDur = 0
    for (let i = newStepIndex; i < steps.length; i++) {
      remainingDist += steps[i].distance
      remainingDur += steps[i].duration
    }

    // Distance to next step maneuver point
    const currentStep = steps[newStepIndex]
    const distToNextStep = currentStep
      ? haversineM(
          userPos.lat,
          userPos.lng,
          currentStep.maneuver.location[1],
          currentStep.maneuver.location[0]
        )
      : 0

    // Update arrival time based on remaining duration
    const arrivalTime = new Date(Date.now() + remainingDur * 1000)

    setState((prev) => ({
      ...prev,
      currentStepIndex: newStepIndex,
      remainingDistanceM: remainingDist,
      remainingDurationS: remainingDur,
      distanceToNextStepM: distToNextStep,
      arrivalTime,
    }))

    // Check if we need to reroute (user went off-route significantly)
    const last = lastRerouteRef.current
    const timeSinceReroute = last ? Date.now() - last.at : Infinity
    const distSinceReroute = last ? haversineM(last.lat, last.lng, userPos.lat, userPos.lng) : Infinity

    // Reroute if moved more than 100m from last reroute point and at least 30s passed
    if (distSinceReroute > 100 && timeSinceReroute > 30000) {
      // Re-fetch route
      void (async () => {
        const result = await fetchRouteWithSteps(
          userPos.lat,
          userPos.lng,
          destination.lat,
          destination.lon,
          mode
        )

        if (result && result.steps.length > 0) {
          setState((prev) => ({
            ...prev,
            steps: result.steps,
            currentStepIndex: 0,
            totalDistanceM: result.totalDistanceM,
            totalDurationS: result.totalDurationS,
            remainingDistanceM: result.totalDistanceM,
            remainingDurationS: result.totalDurationS,
          }))

          if (result.geometry) {
            setRouteGeometry({
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: {},
                  geometry: result.geometry,
                },
              ],
            })
          }

          lastRerouteRef.current = { lat: userPos.lat, lng: userPos.lng, at: Date.now() }
        }
      })()
    }
  }, [userPos?.lat, userPos?.lng, state.isNavigating, destination, mode, onArrival, stopNavigation])

  // Current and next step helpers
  const currentStep = state.steps[state.currentStepIndex] || null
  const nextStep = state.steps[state.currentStepIndex + 1] || null

  return {
    ...state,
    currentStep,
    nextStep,
    routeGeometry,
    startNavigation,
    stopNavigation,
  }
}
