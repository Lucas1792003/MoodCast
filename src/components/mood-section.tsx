"use client"

import { Smile } from "lucide-react"

interface MoodSectionProps {
  temperature: number
  weatherCode: number
}

export default function MoodSection({ temperature, weatherCode }: MoodSectionProps) {
  const getMoodRecommendation = () => {
    if (weatherCode === 0) {
      return {
        mood: "Energized",
        emoji: "✨",
        color: "from-accent to-yellow-400",
        suggestion: "Perfect day to feel motivated and active!",
      }
    }
    if (weatherCode >= 3 && weatherCode < 50) {
      return {
        mood: "Calm",
        emoji: "🧘",
        color: "from-secondary to-blue-300",
        suggestion: "Great day for introspection and relaxation.",
      }
    }
    if (weatherCode >= 50) {
      return {
        mood: "Cozy",
        emoji: "🏠",
        color: "from-primary to-orange-400",
        suggestion: "Perfect weather for indoor activities and comfort.",
      }
    }
    return {
      mood: "Balanced",
      emoji: "⚖️",
      color: "from-primary to-secondary",
      suggestion: "A great day for balanced activities.",
    }
  }

  const rec = getMoodRecommendation()

  return (
    <div className={`bg-gradient-to-br ${rec.color} rounded-2xl p-8 text-white shadow-sm border border-white/10`}>
      <div className="flex items-center gap-3 mb-4">
        <Smile className="w-6 h-6" />
        <h3 className="text-lg font-semibold">Your Mood</h3>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-5xl font-bold mb-2">{rec.emoji}</p>
          <p className="text-2xl font-bold mb-2">{rec.mood}</p>
          <p className="text-white/90 text-sm max-w-xs">{rec.suggestion}</p>
        </div>
      </div>
    </div>
  )
}
