"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Cloud, AlertTriangle } from "lucide-react"

import Header from "@/components/header"
import WeatherCard from "@/components/weather-card"
import MoodSection from "@/components/mood-section"
import OutfitSection from "@/components/outfit-section"
import ActivitySection from "@/components/activity-section"
import HealthSection from "@/components/health-section"
import ARSkyViewer from "@/components/ar-sky-viewer"
import HourlyForecastCard from "@/components/forecast-hourly-card"
import Forecast7DayCard from "@/components/forecast-7day-card"
import ExtremeWeatherAlertsCard from "@/components/extreme-weather-alerts-card"

import WeatherThemeLayer from "@/components/weather-theme-layer"
import WeatherInfoGridCycler from "@/components/weather-info-grid-cycler"

import { ResponsiveCardLayout } from "@/components/cards"
import { FloatingFanMenu } from "@/components/FloatingFanMenu"
import { useCardPreferences } from "@/hooks/useCardPreferences"
import { useUser } from "@/hooks/useUser"
import type { CardId } from "@/config/cards"
import { adaptHourlyForecast, adaptDailyForecast } from "@/config/cards"

import { geocodeCity, getWeather } from "@/lib/weather-client"
import type { WeatherResult } from "@/lib/weather-types"
import type { MoodId } from "@/lib/mood-types"

type OpenMeteoCurrentLike = {
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  weather_code: number
  wind_speed_10m: number
  visibility: number
  is_day?: number
  uv_index?: number
  cloud_cover?: number
  pressure_msl?: number
  dew_point_2m?: number

  precipitation_probability?: number
  precipitation?: number

  wind_gusts_10m?: number
  wind_direction_10m?: number

  sunrise?: string
  sunset?: string
}

export default function Page() {
  const [weather, setWeather] = useState<WeatherResult | null>(null)
  const [locationLabel, setLocationLabel] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  const [hasSearched, setHasSearched] = useState(false)

  // Mood state: null = use weather-suggested mood, otherwise user's choice
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null)

  const { preferences, setActiveTab, getVisibleCards } = useCardPreferences()
  const { user } = useUser()

  const lastGeoCacheRef = useRef<{
    lat: number
    lon: number
    weather: WeatherResult
    fetchedAt: number
  } | null>(null)

  const GEO_CACHE_MAX_AGE_MS = 10 * 60 * 1000
  const GEO_MATCH_RADIUS_M = 250

  const toRad = (d: number) => (d * Math.PI) / 180
  const distM = (aLat: number, aLon: number, bLat: number, bLon: number) => {
    const R = 6371000
    const dLat = toRad(bLat - aLat)
    const dLon = toRad(bLon - aLon)
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(aLat)) *
        Math.cos(toRad(bLat)) *
        Math.sin(dLon / 2) ** 2
    return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  }

  const weatherForComponents: OpenMeteoCurrentLike | null = useMemo(() => {
    if (!weather) return null

    return {
      temperature_2m: weather.temperature,
      relative_humidity_2m: weather.humidity,
      apparent_temperature: weather.feelsLike,
      weather_code: weather.weatherCode,
      wind_speed_10m: weather.windSpeed,
      visibility: weather.visibility,
      is_day: weather.isDay ? 1 : 0,
      uv_index: weather.uvIndex ?? undefined,
      cloud_cover: weather.cloudCover ?? undefined,
      pressure_msl: weather.pressureMsl ?? undefined,
      dew_point_2m: weather.dewPoint ?? undefined,

      precipitation_probability: weather.precipitationProbability ?? undefined,
      precipitation: weather.precipitation ?? undefined,

      wind_gusts_10m: weather.windGusts ?? undefined,
      wind_direction_10m: weather.windDirection ?? undefined,

      sunrise: weather.sunrise ?? undefined,
      sunset: weather.sunset ?? undefined,
    }
  }, [weather])

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.")
      return
    }

    let active = true
    setLoading(true)
    setError("")

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          const fastLabel = "Current location"
          if (!active) return
          setLocationLabel(fastLabel)

          const w = await getWeather(latitude, longitude, fastLabel)
          if (!active) return
          setWeather(w)

          lastGeoCacheRef.current = {
            lat: latitude,
            lon: longitude,
            weather: w,
            fetchedAt: Date.now(),
          }

          setHasSearched(false)

          void (async () => {
            try {
              const r = await fetch(
                `/api/reverse-city?lat=${latitude}&lon=${longitude}`,
                { cache: "no-store" }
              )
              if (!r.ok) return
              const data = await r.json()
              const label =
                typeof data?.label === "string" && data.label.trim()
                  ? data.label.trim()
                  : ""

              if (label && active) setLocationLabel(label)
            } catch {
              // ignore
            }
          })()
        } catch {
          if (active) setError("Couldn't load weather for your location.")
        } finally {
          if (active) setLoading(false)
        }
      },
      (geoErr) => {
        if (!active) return
        if (geoErr?.code === 1) {
          setError("Location permission denied. Please allow location access.")
        } else {
          setError("Couldn't get your current location.")
        }
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 5 * 60 * 1000,
      }
    )

    return () => {
      active = false
    }
  }, [])

  const handleLocationSearch = async (input: string) => {
    const q = input.trim()
    if (!q) return

    setLoading(true)
    setError("")

    try {
      if (q.startsWith("geo:")) {
        const raw = q.slice(4)

        const pipeIdx = raw.indexOf("|")
        const coordsPart = pipeIdx >= 0 ? raw.slice(0, pipeIdx) : raw
        const labelPart = pipeIdx >= 0 ? raw.slice(pipeIdx + 1) : ""

        const [latStr, lonStr] = coordsPart.split(",")
        const lat = Number(latStr?.trim())
        const lon = Number(lonStr?.trim())

        if (!Number.isFinite(lat) || !Number.isFinite(lon))
          throw new Error("Invalid coords")

        const label = labelPart ? decodeURIComponent(labelPart) : ""

        const cached = lastGeoCacheRef.current
        if (cached) {
          const ageOk = Date.now() - cached.fetchedAt <= GEO_CACHE_MAX_AGE_MS
          const nearOk =
            distM(lat, lon, cached.lat, cached.lon) <= GEO_MATCH_RADIUS_M

          if (ageOk && nearOk) {
            setWeather(cached.weather)
            setLocationLabel(label || cached.weather.locationName || "Near you")
            setHasSearched(true)
            setLoading(false)
            return
          }
        }

        const w = await getWeather(lat, lon, label || undefined)

        setWeather(w)
        setLocationLabel(w.locationName || label || "Near you")
        setHasSearched(true)
        lastGeoCacheRef.current = { lat, lon, weather: w, fetchedAt: Date.now() }
        return
      }

      const g = await geocodeCity(q)
      const display = g.country ? `${g.name}, ${g.country}` : g.name
      const w = await getWeather(g.latitude, g.longitude, display)

      setWeather(w)
      setLocationLabel(w.locationName || display)
      setHasSearched(true)
    } catch {
      setError("Location not found or weather service unavailable.")
    } finally {
      setLoading(false)
    }
  }

  const getWeatherDescription = (code?: number) => {
    const c = typeof code === "number" ? code : 3
    if (c === 0) return "Clear sky"
    if (c === 1 || c === 2) return "Mostly clear"
    if (c === 3) return "Overcast"
    if (c === 45 || c === 48) return "Foggy"
    if (c >= 51 && c <= 67) return "Drizzle"
    if (c >= 71 && c <= 77) return "Snow"
    if (c >= 80 && c <= 82) return "Rain showers"
    if (c >= 85 && c <= 86) return "Snow showers"
    if (c >= 95 && c <= 99) return "Thunderstorm"
    return "Mixed conditions"
  }

  const hourlyForecastData = useMemo(() => {
    if (!weather?.hourlyForecast) return undefined
    return adaptHourlyForecast({
      time: weather.hourlyForecast.map((h: any) => h.time),
      temperature_2m: weather.hourlyForecast.map((h: any) => h.temperature),
      weathercode: weather.hourlyForecast.map((h: any) => h.weatherCode),
    })
  }, [weather?.hourlyForecast])

  const dailyForecastData = useMemo(() => {
    if (!weather?.dailyForecast) return undefined
    return adaptDailyForecast({
      time: weather.dailyForecast.map((d: any) => d.date),
      temperature_2m_min: weather.dailyForecast.map((d: any) => d.tempMin),
      temperature_2m_max: weather.dailyForecast.map((d: any) => d.tempMax),
      weathercode: weather.dailyForecast.map((d: any) => d.weatherCode),
    })
  }, [weather?.dailyForecast])

  // ✅ Use ReactNode without needing React namespace
  const cardContent: Record<CardId, ReactNode> = {
    weather: null,
    "weather-info": null,
    "forecast-hourly": <HourlyForecastCard data={hourlyForecastData} />,
    "weather-alerts": (
      <ExtremeWeatherAlertsCard
        hourly={hourlyForecastData}
        daily={dailyForecastData}
        windSpeed={weatherForComponents?.wind_speed_10m ?? null}
        precipitationProbability={weatherForComponents?.precipitation_probability ?? null}
        currentWeatherCode={weatherForComponents?.weather_code ?? null}
      />
    ),
    "forecast-7day": <Forecast7DayCard data={dailyForecastData} />,
    mood: weatherForComponents ? (
      <MoodSection
        temperature={weatherForComponents.temperature_2m}
        weatherCode={weatherForComponents.weather_code}
        selectedMood={selectedMood}
        onMoodChange={setSelectedMood}
      />
    ) : null,
    outfit: weatherForComponents ? (
      <OutfitSection
        temperature={weatherForComponents.apparent_temperature}
        weatherCode={weatherForComponents.weather_code}
        locationLabel={locationLabel}
        lat={weather?.latitude ?? null}
        lon={weather?.longitude ?? null}
        mood={selectedMood}
      />
    ) : null,
    activity: weatherForComponents ? (
      <ActivitySection
        weather={weatherForComponents}
        location={locationLabel}
        selectedCityEnabled={hasSearched}
        selectedLat={hasSearched ? weather?.latitude : null}
        selectedLon={hasSearched ? weather?.longitude : null}
      />
    ) : null,
    health: weatherForComponents ? (
      <HealthSection
        temperature={weatherForComponents.temperature_2m}
        humidity={weatherForComponents.relative_humidity_2m}
      />
    ) : null,
    "ar-sky": null,
  }

  const visibleCards = getVisibleCards()
  const cardsRef = useRef<HTMLDivElement | null>(null)

  const handleFanSelect = (id: CardId) => {
    setActiveTab(id)
    requestAnimationFrame(() => {
      cardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  return (
    <WeatherThemeLayer
      weatherCode={weatherForComponents?.weather_code ?? 3}
      isDay={weather?.isDay}
      feelsLikeF={weatherForComponents?.apparent_temperature ?? null}
      windSpeed={weatherForComponents?.wind_speed_10m ?? null}
    >
      <Header onSearch={handleLocationSearch} user={user} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {error && (
          <div className="mb-6 rounded-xl border border-border bg-card/90 backdrop-blur p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Something went wrong</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Cloud className="w-10 h-10 text-primary animate-pulse" />
              <p className="text-foreground/60">Loading weather data...</p>
            </div>
          </div>
        )}

        {!loading && !weatherForComponents && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Cloud className="w-12 h-12 text-primary mx-auto" />
              <p className="text-foreground/70">
                Search for a city to see outfits, activities & mood tips.
              </p>
              <p className="text-sm text-muted-foreground">
                Try: London, Tokyo, New York, Toronto…
              </p>
            </div>
          </div>
        )}

        {!loading && weatherForComponents && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch">
              <div className="lg:col-span-2 h-full">
                <div className="h-full">
                  <WeatherCard location={locationLabel} weather={weatherForComponents} />
                </div>
              </div>

              <div className="h-full">
                <WeatherInfoGridCycler
                  weather={weatherForComponents}
                  getWeatherDescription={getWeatherDescription}
                />
              </div>
            </div>

            <div ref={cardsRef} id="cards" className="scroll-mt-[96px]">
              <ResponsiveCardLayout
                activeTab={preferences.activeTab}
                onTabChange={setActiveTab}
                visibleCards={visibleCards}
              >
                {cardContent}
              </ResponsiveCardLayout>
            </div>

            <div className="hidden lg:block">
              <ARSkyViewer
                weatherCode={weatherForComponents.weather_code}
                temperature={weatherForComponents.temperature_2m}
              />
            </div>
          </>
        )}
      </main>

      {!loading && weatherForComponents && (
        <FloatingFanMenu onSelect={handleFanSelect} />
      )}
    </WeatherThemeLayer>
  )
}
