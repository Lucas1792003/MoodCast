"use client"

import { Heart, AlertCircle } from "lucide-react"

interface HealthSectionProps {
  temperature: number
  humidity: number
}

export default function HealthSection({ temperature, humidity }: HealthSectionProps) {
  const getHealthRecommendations = () => {
    const tips = []

    if (temperature > 85) {
      tips.push("💧 Stay hydrated - drink plenty of water")
      tips.push("🧴 Apply sunscreen regularly")
      tips.push("😎 Wear sunglasses to protect your eyes")
    } else if (temperature < 50) {
      tips.push("🧣 Keep hands and face protected")
      tips.push("💨 Avoid prolonged cold exposure")
      tips.push("🔥 Stay warm with proper clothing")
    }

    if (humidity > 70) {
      tips.push("💦 High humidity - may affect breathing")
    }

    if (humidity < 30) {
      tips.push("💧 Dry air alert - moisturize skin")
      tips.push("🌬️ Use a humidifier indoors")
    }

    return tips
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Heart className="w-6 h-6 text-destructive" />
        <h3 className="text-lg font-semibold text-foreground">Health & Wellness</h3>
      </div>
      <div className="space-y-3">
        {getHealthRecommendations().map((tip, idx) => (
          <div key={idx} className="flex gap-3">
            <AlertCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-foreground text-sm">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
