"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import { Loader2, Sparkles } from "lucide-react"
import ActivityMap from "@/components/activity-map"

import {
  type PlaceRef,
  type ApiOut,
  type Mode,
  SUBTITLE_VARIANTS,
  cn,
  readWeather,
  cleanSubtitle,
  generateSubtitleByPlaceId,
} from "./activity"

import { PrimaryCard } from "./activity/PrimaryCard"
import { SuggestionCard } from "./activity/SuggestionCard"
import { NavigationControls } from "./activity/NavigationControls"
import { NavigationPanel } from "./activity/NavigationPanel"
import { useGpsTracking } from "./activity/useGpsTracking"
import { useRouting } from "./activity/useRouting"
import { useNavigation } from "./activity/useNavigation"
import { useCompassHeading } from "./activity/useCompassHeading"

export default function ActivitySection({
  weather,
  location,
  selectedLat,
  selectedLon,
  selectedCityEnabled,
}: {
  weather: any
  location: string
  selectedLat?: number | null
  selectedLon?: number | null
  selectedCityEnabled?: boolean
}) {
  const w = useMemo(() => readWeather(weather), [weather])

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ApiOut | null>(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>("walk")
  const [phase, setPhase] = useState<"idle" | "loading" | "reveal" | "split">("idle")
  const [subtitleSeed, setSubtitleSeed] = useState<number>(() => Date.now())

  // Mobile swipe view: 0 = map, 1 = suggestions
  const [mobileView, setMobileView] = useState<0 | 1>(0)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const timerRef = useRef<number | null>(null)
  const [tick, setTick] = useState(0)
  const now = useMemo(() => Date.now(), [tick])

  // GPS tracking hook
  const {
    userPos,
    gpsAccuracyM,
    lastGpsAt,
    setUserPos,
    setGpsAccuracyM,
    setLastGpsAt,
    startWatching,
    stopWatching,
  } = useGpsTracking()

  // Derived data
  const allPlaces = useMemo(() => {
    const out: PlaceRef[] = []
    if (data?.primary?.place) out.push(data.primary.place)
    for (const s of data?.secondary ?? []) if (s.place) out.push(s.place)
    const m = new Map<string, PlaceRef>()
    for (const p of out) m.set(p.id, p)
    return Array.from(m.values())
  }, [data])

  const selectedPlace = useMemo(() => {
    if (!selectedPlaceId) return null
    return allPlaces.find((p) => p.id === selectedPlaceId) ?? null
  }, [allPlaces, selectedPlaceId])

  // Routing hook
  const { routeGeojson, travelById, resetRouting } = useRouting({
    userPos,
    selectedPlace,
    allPlaces,
    mode,
    now,
    hasData: !!data,
  })

  // Navigation hook for turn-by-turn directions
  const navigation = useNavigation({
    userPos,
    destination: selectedPlace,
    mode,
    onArrival: () => {
      // Could show a toast or celebration animation here
      console.log("You have arrived!")
    },
  })

  // Compass heading for map rotation during navigation
  const { heading: compassHeading, requestPermission: requestCompassPermission } = useCompassHeading({
    enabled: navigation.isNavigating,
  })

  // Wrapper to request compass permission before starting navigation (needed for iOS)
  const handleStartNavigation = async () => {
    // Request compass permission first (iOS requires user gesture)
    await requestCompassPermission()
    navigation.startNavigation()
  }

  const subtitleByPlaceId = useMemo(
    () => generateSubtitleByPlaceId(data?.secondary, subtitleSeed, SUBTITLE_VARIANTS),
    [data?.secondary, subtitleSeed]
  )

  // Tick for time updates
  useEffect(() => {
    const t = window.setInterval(() => setTick((x) => x + 1), 1000)
    return () => window.clearInterval(t)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      stopWatching()
    }
  }, [stopWatching])

  // Auto-select primary place when data loads
  useEffect(() => {
    if (!data) return
    const primaryId = data.primary?.place?.id
    if (primaryId) setSelectedPlaceId(primaryId)
  }, [data])

  async function fetchSuggestions(lat: number, lon: number) {
    const qs = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      code: String(w.code),
      isDay: w.isDay ? "1" : "0",
      temp: String(w.temp),
    })
    const res = await fetch(`/api/suggestion?${qs.toString()}`, { cache: "no-store" })
    if (!res.ok) throw new Error(`API ${res.status}`)
    return (await res.json()) as ApiOut
  }

  async function run(lat: number, lon: number) {
    setLoading(true)
    setPhase("loading")

    try {
      const json = await fetchSuggestions(lat, lon)
      setData(json)
      setSubtitleSeed(Date.now())
      setPhase("reveal")

      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setPhase("split"), 5000)
    } catch (e: any) {
      setData({
        weatherUsed: { ...w },
        kind: "unknown",
        primary: { headline: "Couldn't fetch nearby ideas", message: `Error: ${e?.message || "Unknown"}` },
        secondary: [],
      })
      setPhase("reveal")
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setPhase("split"), 5000)
    } finally {
      setLoading(false)
    }
  }

  async function handleSuggestGPS() {
    try {
      resetRouting()

      const pos = await startWatching()
      await run(pos.coords.latitude, pos.coords.longitude)
    } catch (e: any) {
      setData({
        weatherUsed: { ...w },
        kind: "unknown",
        primary: { headline: "Couldn't use GPS", message: `Error: ${e?.message || "GPS unavailable"}` },
        secondary: [],
      })
      setPhase("reveal")
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setPhase("split"), 5000)
    }
  }

  async function handleSuggestSelectedCity() {
    const lat = Number(selectedLat)
    const lon = Number(selectedLon)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return

    resetRouting()
    stopWatching()

    setUserPos({ lat, lng: lon })
    setGpsAccuracyM(null)
    setLastGpsAt(Date.now())

    await run(lat, lon)
  }

  const selectedCityReady =
    !!selectedCityEnabled && Number.isFinite(Number(selectedLat)) && Number.isFinite(Number(selectedLon))
  const canShowMap = !!userPos && !!selectedPlace

  // External map links
  const gTravelMode = mode === "walk" ? "walking" : mode === "bike" ? "bicycling" : "driving"
  const aDirFlg = mode === "walk" ? "w" : mode === "bike" ? "b" : "d"

  const googleMapsHref =
    userPos && selectedPlace
      ? `https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lng}&destination=${selectedPlace.lat},${selectedPlace.lon}&travelmode=${gTravelMode}`
      : "#"

  const appleMapsHref =
    userPos && selectedPlace
      ? `https://maps.apple.com/?saddr=${userPos.lat},${userPos.lng}&daddr=${selectedPlace.lat},${selectedPlace.lon}&dirflg=${aDirFlg}`
      : "#"

  function selectPlace(id: string) {
    setSelectedPlaceId(id)
    // Auto-switch to map view on mobile when a place is selected
    setMobileView(0)
  }

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const diff = touchStartX.current - touchEndX.current
    const threshold = 50 // minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left -> show suggestions
        setMobileView(1)
      } else {
        // Swipe right -> show map
        setMobileView(0)
      }
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  return (
    <section className="w-full rounded-3xl p-4 sm:p-5 md:p-6 bg-white border border-slate-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Activities</h2>
          <p className="mt-1 text-sm md:text-base text-slate-600">
            Suggestions for <span className="font-medium">{location}</span> based on weather + what's nearby.
          </p>
          <p className="mt-1 text-xs md:text-sm text-slate-500 italic">
            {selectedCityEnabled
              ? "\"Today\" uses your real GPS. \"Selected city\" uses the city you searched in the header."
              : "Note: This section uses your real location (GPS). Search a city to unlock city-based suggestions."}
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 w-full sm:w-[320px]">
          <button
            onClick={handleSuggestGPS}
            disabled={loading}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 w-full",
              "bg-blue-600 text-white disabled:opacity-60"
            )}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Suggestion activity for today
          </button>

          {selectedCityEnabled && (
            <button
              onClick={handleSuggestSelectedCity}
              disabled={loading || !selectedCityReady}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 w-full",
                "border border-slate-300 bg-white text-slate-900 disabled:opacity-50"
              )}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Selected city activity suggestion
            </button>
          )}
        </div>
      </div>

      {/* Weather info */}
      <div className="mt-4 text-sm text-slate-600">
        Weather now: code {w.code} · {w.isDay ? "day" : "night"} · {Math.round(w.temp)}°
      </div>

      {/* Main content area */}
      <div className={cn(
        "mt-5 relative rounded-3xl border border-slate-200 bg-slate-50 overflow-hidden p-4",
        phase === "idle" || phase === "loading" ? "min-h-[80px]" : "min-h-[260px]"
      )}>
        <LayoutGroup>
          <AnimatePresence mode="wait">
            {phase === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center text-slate-600 py-2"
              >
                Click a button to get today's idea ✨
              </motion.div>
            )}

            {phase === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center text-slate-700 py-2"
              >
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating something nice nearby…
                </div>
              </motion.div>
            )}

            {phase === "reveal" && data && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative h-full"
              >
                {canShowMap && (
                  <div className="absolute inset-0 opacity-0 pointer-events-none">
                    <ActivityMap
                      center={{ lng: selectedPlace!.lon, lat: selectedPlace!.lat }}
                      user={{ lng: userPos!.lng, lat: userPos!.lat }}
                      destination={{ lng: selectedPlace!.lon, lat: selectedPlace!.lat }}
                      routeGeojson={routeGeojson}
                      places={allPlaces}
                      selectedPlaceId={selectedPlaceId ?? undefined}
                      onSelectPlace={(id) => selectPlace(id)}
                    />
                  </div>
                )}

                <div className="relative z-10 h-full flex items-center justify-center">
                  <div className="w-full max-w-3xl">
                    <PrimaryCard
                      data={data.primary}
                      clickable={!!data.primary.place?.id}
                      active={data.primary.place?.id === selectedPlaceId}
                      onSelect={() => {
                        const id = data.primary.place?.id
                        if (id) selectPlace(id)
                      }}
                      travel={data.primary.place?.id ? travelById[data.primary.place.id] : null}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {phase === "split" && data && (
              <motion.div
                key="split"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Desktop: Side by side layout */}
                <div className="hidden lg:grid lg:grid-cols-2 gap-4 lg:items-stretch">
                  {/* Left column - Map */}
                  <div className="flex flex-col">
                    {canShowMap ? (
                      <>
                        <div className="relative w-full flex-1 min-h-[320px] rounded-3xl overflow-hidden border border-slate-200 bg-slate-50">
                          <ActivityMap
                            center={{ lng: selectedPlace!.lon, lat: selectedPlace!.lat }}
                            user={{ lng: userPos!.lng, lat: userPos!.lat }}
                            destination={{ lng: selectedPlace!.lon, lat: selectedPlace!.lat }}
                            routeGeojson={navigation.isNavigating ? navigation.routeGeometry : routeGeojson}
                            places={allPlaces}
                            selectedPlaceId={selectedPlaceId ?? undefined}
                            onSelectPlace={(id) => selectPlace(id)}
                            className="w-full h-full"
                            isNavigating={navigation.isNavigating}
                            compassHeading={compassHeading}
                          />

                          {/* Navigation Panel overlay */}
                          <NavigationPanel
                            isNavigating={navigation.isNavigating}
                            currentStep={navigation.currentStep}
                            nextStep={navigation.nextStep}
                            distanceToNextStepM={navigation.distanceToNextStepM}
                            remainingDistanceM={navigation.remainingDistanceM}
                            remainingDurationS={navigation.remainingDurationS}
                            arrivalTime={navigation.arrivalTime}
                            currentStepIndex={navigation.currentStepIndex}
                            totalSteps={navigation.steps.length}
                            onStop={navigation.stopNavigation}
                          />
                        </div>

                        <NavigationControls
                          mode={mode}
                          setMode={setMode}
                          gpsAccuracyM={gpsAccuracyM}
                          lastGpsAt={lastGpsAt}
                          now={now}
                          userPos={userPos}
                          selectedPlace={selectedPlace}
                          googleMapsHref={googleMapsHref}
                          appleMapsHref={appleMapsHref}
                          onStartNavigation={handleStartNavigation}
                          isNavigating={navigation.isNavigating}
                        />
                      </>
                    ) : (
                      <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                        Allow location access to see the map + live tracking.
                      </div>
                    )}
                  </div>

                  {/* Right column - Cards */}
                  <div className="flex flex-col space-y-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-700 mb-3">Today's pick</div>
                      <PrimaryCard
                        data={data.primary}
                        clickable={!!data.primary.place?.id}
                        active={data.primary.place?.id === selectedPlaceId}
                        onSelect={() => {
                          const id = data.primary.place?.id
                          if (id) selectPlace(id)
                        }}
                        travel={data.primary.place?.id ? travelById[data.primary.place.id] : null}
                      />
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-slate-700 mb-3">Other things you can do nearby</div>
                      {data.secondary?.length ? (
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          {data.secondary.map((s, i) => {
                            const p = s.place
                            const pid = p?.id
                            const active = !!pid && pid === selectedPlaceId
                            return (
                              <SuggestionCard
                                key={`${s.headline}-${i}`}
                                title={s.headline}
                                subtitle={cleanSubtitle(s.message) || (pid ? subtitleByPlaceId[pid] : "") || "Nice spot nearby"}
                                address={p?.address}
                                category={p?.category}
                                active={!!active}
                                onSelect={pid ? () => selectPlace(pid) : undefined}
                                travel={pid ? travelById[pid] : null}
                                distanceFallbackM={p?.distanceM}
                              />
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-slate-600">No extra nearby options found this time — try again.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile: Swipeable pages */}
                <div className="lg:hidden">
                  {/* Swipeable container */}
                  <div
                    className="relative overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div
                      className="flex transition-transform duration-300 ease-out"
                      style={{ transform: `translateX(-${mobileView * 100}%)` }}
                    >
                      {/* Page 1: Map */}
                      <div className="w-full flex-shrink-0 min-h-[580px]">
                        {canShowMap ? (
                          <div className="flex flex-col h-full">
                            <div className="text-sm font-semibold text-slate-700 mb-3">Route to destination</div>
                            <div className="relative w-full h-[420px] rounded-3xl overflow-hidden border border-slate-200 bg-slate-50">
                              <ActivityMap
                                center={{ lng: selectedPlace!.lon, lat: selectedPlace!.lat }}
                                user={{ lng: userPos!.lng, lat: userPos!.lat }}
                                destination={{ lng: selectedPlace!.lon, lat: selectedPlace!.lat }}
                                routeGeojson={navigation.isNavigating ? navigation.routeGeometry : routeGeojson}
                                places={allPlaces}
                                selectedPlaceId={selectedPlaceId ?? undefined}
                                onSelectPlace={(id) => selectPlace(id)}
                                className="absolute inset-0"
                                isNavigating={navigation.isNavigating}
                                compassHeading={compassHeading}
                              />

                              <NavigationPanel
                                isNavigating={navigation.isNavigating}
                                currentStep={navigation.currentStep}
                                nextStep={navigation.nextStep}
                                distanceToNextStepM={navigation.distanceToNextStepM}
                                remainingDistanceM={navigation.remainingDistanceM}
                                remainingDurationS={navigation.remainingDurationS}
                                arrivalTime={navigation.arrivalTime}
                                currentStepIndex={navigation.currentStepIndex}
                                totalSteps={navigation.steps.length}
                                onStop={navigation.stopNavigation}
                              />
                            </div>

                            <NavigationControls
                              mode={mode}
                              setMode={setMode}
                              gpsAccuracyM={gpsAccuracyM}
                              lastGpsAt={lastGpsAt}
                              now={now}
                              userPos={userPos}
                              selectedPlace={selectedPlace}
                              googleMapsHref={googleMapsHref}
                              appleMapsHref={appleMapsHref}
                              onStartNavigation={handleStartNavigation}
                              isNavigating={navigation.isNavigating}
                            />

                            {/* Dot indicators under map */}
                            <div className="flex items-center justify-center gap-2 mt-4">
                              <button
                                onClick={() => setMobileView(0)}
                                className={cn(
                                  "w-2 h-2 rounded-full transition-all",
                                  mobileView === 0 ? "bg-blue-600 w-6" : "bg-slate-300"
                                )}
                                aria-label="View map"
                              />
                              <button
                                onClick={() => setMobileView(1)}
                                className={cn(
                                  "w-2 h-2 rounded-full transition-all",
                                  mobileView === 1 ? "bg-blue-600 w-6" : "bg-slate-300"
                                )}
                                aria-label="View places"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col h-full">
                            <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 flex-1 flex items-center justify-center">
                              Allow location access to see the map + live tracking.
                            </div>
                            {/* Dot indicators */}
                            <div className="flex items-center justify-center gap-2 mt-4">
                              <button
                                onClick={() => setMobileView(0)}
                                className={cn(
                                  "w-2 h-2 rounded-full transition-all",
                                  mobileView === 0 ? "bg-blue-600 w-6" : "bg-slate-300"
                                )}
                                aria-label="View map"
                              />
                              <button
                                onClick={() => setMobileView(1)}
                                className={cn(
                                  "w-2 h-2 rounded-full transition-all",
                                  mobileView === 1 ? "bg-blue-600 w-6" : "bg-slate-300"
                                )}
                                aria-label="View places"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Page 2: Suggestions */}
                      <div className="w-full flex-shrink-0 pl-4 min-h-[580px]">
                        <div className="flex flex-col h-full">
                          <div className="flex-1 space-y-4">
                            <div>
                              <div className="text-sm font-semibold text-slate-700 mb-3">Today's pick</div>
                              <PrimaryCard
                                data={data.primary}
                                clickable={!!data.primary.place?.id}
                                active={data.primary.place?.id === selectedPlaceId}
                                onSelect={() => {
                                  const id = data.primary.place?.id
                                  if (id) selectPlace(id)
                                }}
                                travel={data.primary.place?.id ? travelById[data.primary.place.id] : null}
                              />
                            </div>

                            <div>
                              <div className="text-sm font-semibold text-slate-700 mb-3">Other things you can do nearby</div>
                              {data.secondary?.length ? (
                                <div className="grid grid-cols-2 gap-2">
                                  {data.secondary.map((s, i) => {
                                    const p = s.place
                                    const pid = p?.id
                                    const active = !!pid && pid === selectedPlaceId
                                    return (
                                      <SuggestionCard
                                        key={`${s.headline}-${i}`}
                                        title={s.headline}
                                        subtitle={cleanSubtitle(s.message) || (pid ? subtitleByPlaceId[pid] : "") || "Nice spot nearby"}
                                        address={p?.address}
                                        category={p?.category}
                                        active={!!active}
                                        onSelect={pid ? () => selectPlace(pid) : undefined}
                                        travel={pid ? travelById[pid] : null}
                                        distanceFallbackM={p?.distanceM}
                                      />
                                    )
                                  })}
                                </div>
                              ) : (
                                <div className="text-slate-600">No extra nearby options found this time — try again.</div>
                              )}
                            </div>
                          </div>

                          {/* Dot indicators under places */}
                          <div className="flex items-center justify-center gap-2 mt-4">
                            <button
                              onClick={() => setMobileView(0)}
                              className={cn(
                                "w-2 h-2 rounded-full transition-all",
                                mobileView === 0 ? "bg-blue-600 w-6" : "bg-slate-300"
                              )}
                              aria-label="View map"
                            />
                            <button
                              onClick={() => setMobileView(1)}
                              className={cn(
                                "w-2 h-2 rounded-full transition-all",
                                mobileView === 1 ? "bg-blue-600 w-6" : "bg-slate-300"
                              )}
                              aria-label="View places"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  )
}
