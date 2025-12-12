"use client"

import { useEffect, useMemo, useState } from "react"
import { Cloud, AlertTriangle } from "lucide-react"

import Header from "@/components/header"
import WeatherCard from "@/components/weather-card"
import MoodSection from "@/components/mood-section"
import OutfitSection from "@/components/outfit-section"
import ActivitySection from "@/components/activity-section"
import HealthSection from "@/components/health-section"
import ARSkyViewer from "@/components/ar-sky-viewer"

import WeatherThemeLayer from "@/components/weather-theme-layer"
import WeatherInfoGridCycler from "@/components/weather-info-grid-cycler"

import { geocodeCity, getWeather } from "@/lib/weather-client"
import type { WeatherResult } from "@/lib/weather-types"

type OpenMeteoCurrentLike = {
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  weather_code: number
  wind_speed_10m: number
  visibility: number
  is_day?: number

  // ✅ extras for the cycler pages
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

  // ✅ only true after user searches in the header
  const [hasSearched, setHasSearched] = useState(false)

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

      // ✅ pass-through extras (will be defined once API returns them)
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
    if (!navigator.geolocation) return

    setLoading(true)
    setError("")

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const w = await getWeather(latitude, longitude)
          setWeather(w)
          setLocationLabel(w.locationName || "Current location")

          // ✅ initial load = GPS, not "searched"
          setHasSearched(false)
        } catch {
          setError("Couldn’t load weather for your location.")
        } finally {
          setLoading(false)
        }
      },
      () => {
        setLoading(false)
      }
    )
  }, [])

  const handleLocationSearch = async (input: string) => {
    const q = input.trim()
    if (!q) return

    setLoading(true)
    setError("")

    try {
      if (q.startsWith("geo:")) {
        const raw = q.slice(4)
        const [latStr, lonStr] = raw.split(",")
        const lat = Number(latStr?.trim())
        const lon = Number(lonStr?.trim())

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          throw new Error("Invalid coords")
        }

        const w = await getWeather(lat, lon)
        setWeather(w)
        setLocationLabel(w.locationName || "Near you")

        // ✅ user typed a location
        setHasSearched(true)
        return
      }

      const g = await geocodeCity(q)
      const display = g.country ? `${g.name}, ${g.country}` : g.name
      const w = await getWeather(g.latitude, g.longitude, display)

      setWeather(w)
      setLocationLabel(w.locationName || display)

      // ✅ user searched a city
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

  return (
    <WeatherThemeLayer
      weatherCode={weatherForComponents?.weather_code ?? 3}
      isDay={weather?.isDay}
      feelsLikeF={weatherForComponents?.apparent_temperature ?? null}
      windSpeed={weatherForComponents?.wind_speed_10m ?? null}
    >
      <Header onSearch={handleLocationSearch} />

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
              <p className="text-sm text-muted-foreground">Try: London, Tokyo, New York, Toronto…</p>
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


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <MoodSection
                temperature={weatherForComponents.temperature_2m}
                weatherCode={weatherForComponents.weather_code}
              />
              <OutfitSection
                temperature={weatherForComponents.apparent_temperature}
                weatherCode={weatherForComponents.weather_code}
              />
            </div>

            <div className="mb-8">
              <ActivitySection
                weather={weatherForComponents}
                location={locationLabel}
                selectedCityEnabled={hasSearched}
                selectedLat={hasSearched ? weather?.latitude : null}
                selectedLon={hasSearched ? weather?.longitude : null}
              />
            </div>

            <div className="mb-8">
              <HealthSection
                temperature={weatherForComponents.temperature_2m}
                humidity={weatherForComponents.relative_humidity_2m}
              />
            </div>

            <ARSkyViewer
              weatherCode={weatherForComponents.weather_code}
              temperature={weatherForComponents.temperature_2m}
            />
          </>
        )}
      </main>
    </WeatherThemeLayer>
  )
}
