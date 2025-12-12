"use client"

import { useEffect, useMemo, useState } from "react"
import { Cloud, Wind, Droplets, Eye, Gauge, AlertTriangle } from "lucide-react"

import Header from "@/components/header"
import WeatherCard from "@/components/weather-card"
import MoodSection from "@/components/mood-section"
import OutfitSection from "@/components/outfit-section"
import ActivitySection from "@/components/activity-section"
import HealthSection from "@/components/health-section"
import ARSkyViewer from "@/components/ar-sky-viewer"

import WeatherThemeLayer from "@/components/weather-theme-layer"
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

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Clear sky"
    if (code === 1 || code === 2) return "Mostly clear"
    if (code === 3) return "Overcast"
    if (code === 45 || code === 48) return "Foggy"
    if (code >= 51 && code <= 67) return "Drizzle"
    if (code >= 71 && code <= 77) return "Snow"
    if (code >= 80 && code <= 82) return "Rain showers"
    if (code >= 85 && code <= 86) return "Snow showers"
    if (code >= 95 && code <= 99) return "Thunderstorm"
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <WeatherCard location={locationLabel} weather={weatherForComponents} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card/90 backdrop-blur rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-4 h-4 text-primary" />
                    <p className="text-xs font-medium text-muted-foreground">Humidity</p>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {Math.round(weatherForComponents.relative_humidity_2m)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Feels more sticky as it rises</p>
                </div>

                <div className="bg-card/90 backdrop-blur rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-4 h-4 text-primary" />
                    <p className="text-xs font-medium text-muted-foreground">Wind</p>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {Math.round(weatherForComponents.wind_speed_10m)} mph
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Stronger winds = extra chill</p>
                </div>

                <div className="bg-card/90 backdrop-blur rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <p className="text-xs font-medium text-muted-foreground">Visibility</p>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {(weatherForComponents.visibility / 1000).toFixed(1)} km
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fog & haze can reduce how far you see
                  </p>
                </div>

                <div className="bg-card/90 backdrop-blur rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="w-4 h-4 text-primary" />
                    <p className="text-xs font-medium text-muted-foreground">Feels like</p>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {Math.round(weatherForComponents.apparent_temperature)}°
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getWeatherDescription(weatherForComponents.weather_code)}
                  </p>
                </div>
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
