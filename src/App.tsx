import { useEffect, useState } from "react"
import { Cloud, Wind, Droplets, Eye, Gauge } from "lucide-react"

import Header from "./components/header"
import WeatherCard from "./components/weather-card"
import MoodSection from "./components/mood-section"
import OutfitSection from "./components/outfit-section"
import ActivitySection from "./components/activity-section"
import HealthSection from "./components/health-section"
import ARSkyViewer from "./components/ar-sky-viewer"
import WeatherThemeLayer from "./components/weather-theme-layer"

type CurrentWeather = {
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  weather_code: number
  wind_speed_10m: number
  visibility: number
  is_day?: number
}

function App() {
  const [weather, setWeather] = useState<CurrentWeather | null>(null)
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          await fetchWeather(latitude, longitude)
        },
        () => {
          // Fallback city if user denies location
          fetchWeatherByCity("San Francisco")
        },
      )
    }
  }, [])

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility,is_day&timezone=auto&temperature_unit=fahrenheit&wind_speed_unit=mph`,
      )
      const data = await response.json()
      setWeather(data.current)
      setLocation(`${lat.toFixed(2)}°N, ${lon.toFixed(2)}°W`)
    } catch (error) {
      console.error("Weather fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeatherByCity = async (city: string) => {
    setLoading(true)
    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city,
        )}&count=1&language=en&format=json`,
      )
      const geoData = await geoResponse.json()
      if (geoData.results?.[0]) {
        const { latitude, longitude, name, country } = geoData.results[0]
        setLocation(`${name}, ${country}`)
        await fetchWeather(latitude, longitude)
      }
    } catch (error) {
      console.error("Weather fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSearch = (city: string) => {
    if (!city.trim()) return
    fetchWeatherByCity(city.trim())
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
      weatherCode={weather?.weather_code ?? 3}
      isDay={weather ? Boolean(weather.is_day) : undefined}
      feelsLikeF={weather?.apparent_temperature ?? null}
      windSpeed={weather?.wind_speed_10m ?? null}
    >
      <div className="min-h-screen">
        <Header onSearch={handleLocationSearch} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Cloud className="w-10 h-10 text-primary animate-pulse" />
              <p className="text-foreground/60">Loading weather data...</p>
            </div>
          </div>
        )}

        {!loading && !weather && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Cloud className="w-12 h-12 text-primary mx-auto" />
              <p className="text-foreground/60">
                Search for a city to see outfits, activities & mood tips.
              </p>
            </div>
          </div>
        )}

        {!loading && weather && (
          <>
            {/* Top: Weather card + stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <WeatherCard weather={weather} location={location} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-4 h-4 text-primary" />
                    <p className="text-xs font-medium text-muted-foreground">
                      Humidity
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {Math.round(weather.relative_humidity_2m)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Feels more sticky as it rises
                  </p>
                </div>

                <div className="bg-card rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-4 h-4 text-primary" />
                    <p className="text-xs font-medium text-muted-foreground">
                      Wind
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {Math.round(weather.wind_speed_10m)} mph
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Stronger winds = extra chill
                  </p>
                </div>

                <div className="bg-card rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <p className="text-xs font-medium text-muted-foreground">
                      Visibility
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {(weather.visibility / 1000).toFixed(1)} km
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fog & haze can reduce how far you see
                  </p>
                </div>

                <div className="bg-card rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="w-4 h-4 text-primary" />
                    <p className="text-xs font-medium text-muted-foreground">
                      Feels like
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {Math.round(weather.apparent_temperature)}°F
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getWeatherDescription(weather.weather_code)}
                  </p>
                </div>
              </div>
            </div>

            {/* Mood + Outfit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <MoodSection
                temperature={weather.temperature_2m}
                weatherCode={weather.weather_code}
              />
              <OutfitSection
                temperature={weather.apparent_temperature}
                weatherCode={weather.weather_code}
              />
            </div>

            {/* Activity suggestions */}
            <div className="mb-8">
              <ActivitySection
                weatherCode={weather.weather_code}
                temperature={weather.temperature_2m}
              />
            </div>

            {/* Health & comfort */}
            <div className="mb-8">
              <HealthSection
                temperature={weather.temperature_2m}
                humidity={weather.relative_humidity_2m}
              />
            </div>

            {/* AR sky viewer */}
            <ARSkyViewer
              weatherCode={weather.weather_code}
              temperature={weather.temperature_2m}
            />
          </>
        )}
        </main>
      </div>
    </WeatherThemeLayer>
  )
}

export default App
