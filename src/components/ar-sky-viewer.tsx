"use client"

import { useState } from "react"
import { Camera, Cloud, Sun, CloudRain } from "lucide-react"

interface ARSkyViewerProps {
  weatherCode: number
  temperature: number
}

export default function ARSkyViewer({ weatherCode, temperature }: ARSkyViewerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getSkyDescription = (code: number) => {
    if (code === 0) return "Clear blue sky with bright sunshine"
    if (code <= 3) return "Partly cloudy with scattered clouds"
    if (code === 45 || code === 48) return "Foggy conditions reducing visibility"
    if (code >= 50) return "Rainy conditions with dark clouds"
    return "Mixed weather conditions"
  }

  const getSkyColor = (code: number) => {
    if (code === 0) return "from-blue-400 to-blue-200"
    if (code <= 3) return "from-blue-300 to-gray-200"
    if (code === 45 || code === 48) return "from-gray-400 to-gray-200"
    return "from-gray-500 to-gray-300"
  }

  return (
    <div className="mt-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-2xl p-8 font-semibold flex items-center justify-center gap-3 hover:shadow-lg transition-all hover:scale-105"
      >
        <Camera className="w-5 h-5" />
        Look at the Sky - AR View
      </button>

      {isOpen && (
        <div className="mt-6 bg-card rounded-2xl border border-border p-8 shadow-sm">
          <div
            className={`bg-gradient-to-b ${getSkyColor(weatherCode)} rounded-xl p-12 mb-6 min-h-64 flex flex-col items-center justify-center relative overflow-hidden`}
          >
            {/* Sky simulation */}
            <div className="absolute inset-0 opacity-20">
              {weatherCode === 0 ? (
                <Sun className="w-32 h-32 text-yellow-300 absolute top-8 right-12" />
              ) : weatherCode <= 3 ? (
                <>
                  <Cloud className="w-24 h-24 text-white absolute top-12 left-12" />
                  <Cloud className="w-20 h-20 text-white absolute top-20 right-20" />
                </>
              ) : weatherCode >= 50 ? (
                <>
                  <CloudRain className="w-32 h-32 text-blue-300 absolute top-12 left-1/4" />
                  <Cloud className="w-28 h-28 text-gray-400 absolute top-20 right-12" />
                </>
              ) : null}
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
              {weatherCode === 0 ? (
                <Sun className="w-20 h-20 text-yellow-300 mx-auto mb-4" />
              ) : weatherCode >= 50 ? (
                <CloudRain className="w-20 h-20 text-blue-400 mx-auto mb-4" />
              ) : (
                <Cloud className="w-20 h-20 text-white mx-auto mb-4" />
              )}
              <p className="text-white font-semibold text-lg">{getSkyDescription(weatherCode)}</p>
              <p className="text-white/80 text-sm mt-2">Temperature: {Math.round(temperature)}°F</p>
            </div>
          </div>

          <p className="text-foreground/70 text-sm text-center">
            This AR view simulates the current sky conditions. In a real app, this would use your device camera to
            overlay weather information.
          </p>
        </div>
      )}
    </div>
  )
}
