"use client"

import React from "react"
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Haze,
} from "lucide-react"

interface WeatherCardProps {
  weather: any
  location: string
}

export default function WeatherCard({ weather, location }: WeatherCardProps) {
  const isDay = typeof weather?.is_day === "number" ? weather.is_day === 1 : true

  const getWeatherIcon = (code: number) => {
    if (code === 0) return isDay ? <Sun className="w-24 h-24" /> : <Moon className="w-24 h-24" />
    if (code === 1 || code === 2) return isDay ? <CloudSun className="w-24 h-24" /> : <CloudMoon className="w-24 h-24" />
    if (code === 3) return <Cloud className="w-24 h-24" />
    if (code >= 45 && code <= 48) return <Haze className="w-24 h-24" />
    if (code >= 95) return <CloudLightning className="w-24 h-24" />
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return <CloudSnow className="w-24 h-24" />
    if (code >= 51 && code <= 82) return <CloudRain className="w-24 h-24" />
    return isDay ? <CloudSun className="w-24 h-24" /> : <CloudMoon className="w-24 h-24" />
  }

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Clear Sky"
    if (code === 1 || code === 2) return "Mostly Clear"
    if (code === 3) return "Overcast"
    if (code === 45 || code === 48) return "Foggy"
    if (code >= 51 && code <= 67) return "Drizzle"
    if (code >= 71 && code <= 77) return "Snow"
    if (code >= 80 && code <= 82) return "Rain Showers"
    if (code >= 85 && code <= 86) return "Snow Showers"
    if (code >= 95) return "Thunderstorm"
    return "Unknown"
  }

  // Put these in /public:
  // /public/day.mp4
  // /public/night.mp4
  const dayVideo = "/day.mp4"
  const nightVideo = "/night.mp4"

  // Keep day bright; night a bit darker for readability
  const overlayClass = isDay ? "bg-black/0" : "bg-black/30"

  // --- Temps ---
  const tempF =
    typeof weather?.temperature_2m === "number" ? weather.temperature_2m : null

  // Convert F -> C
  const tempC = typeof tempF === "number" ? ((tempF - 32) * 5) / 9 : null

  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-border p-8 shadow-sm">
      {/* Background MP4 (original file, no Next image compression) */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={isDay ? dayVideo : nightVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayClass}`} />

      {/* Content */}
      <div className="relative text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-1 drop-shadow">
              {typeof tempF === "number" && typeof tempC === "number" ? (
                <>
                  {Math.round(tempC)}°C{" "}
                  <span className="text-white/85 text-xl font-semibold">
                    ({Math.round(tempF)}°F)
                  </span>
                </>
              ) : (
                "--"
              )}
            </h2>
            <p className="text-sm text-white/90 drop-shadow">{location}</p>
          </div>

          <div className="rounded-2xl bg-black/20 p-3 backdrop-blur-md ring-1 ring-white/15">
            <div className="text-white">{getWeatherIcon(weather.weather_code)}</div>
          </div>
        </div>

        <p className="text-lg font-semibold mb-4 drop-shadow">
          {getWeatherDescription(weather.weather_code)}
        </p>

        <p className="text-sm text-white/90 drop-shadow">
          The current conditions suggest a{" "}
          {typeof tempC === "number"
            ? tempC > 21
              ? "warm"
              : tempC > 10
              ? "mild"
              : "cool"
            : "pleasant"}{" "}
          day ahead.
        </p>
      </div>
    </div>
  )
}
