"use client"

import { Activity } from "lucide-react"

interface ActivitySectionProps {
  weatherCode: number
  temperature: number
}

export default function ActivitySection({ weatherCode, temperature }: ActivitySectionProps) {
  const getRecommendedActivities = () => {
    const activities = []

    if (weatherCode === 0 && temperature > 65) {
      activities.push("🏃 Outdoor running", "🚴 Cycling", "⛱️ Beach time")
    } else if (weatherCode >= 3 && weatherCode < 50) {
      activities.push("🥾 Hiking", "🎨 Outdoor sketching", "📸 Photography walk")
    } else if (weatherCode >= 50) {
      activities.push("📚 Reading indoors", "🎮 Gaming session", "🧘 Yoga practice", "🍳 Cooking new recipe")
    }

    if (temperature < 50) {
      activities.push("⛷️ Winter sports", "☕ Cozy café visit")
    }

    return activities
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-6 h-6 text-secondary" />
        <h3 className="text-lg font-semibold text-foreground">Recommended Activities</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {getRecommendedActivities().map((activity, idx) => (
          <div
            key={idx}
            className="bg-muted rounded-lg p-3 text-sm text-foreground hover:bg-muted/80 transition cursor-pointer"
          >
            {activity}
          </div>
        ))}
      </div>
    </div>
  )
}
