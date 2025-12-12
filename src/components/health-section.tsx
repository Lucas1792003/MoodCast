"use client"

import { useMemo } from "react"
import { Heart, AlertCircle } from "lucide-react"

interface HealthSectionProps {
  temperature: number
  humidity: number
}

export default function HealthSection({ temperature, humidity }: HealthSectionProps) {
  const tips = useMemo(() => {
    const t: string[] = []

    if (temperature > 85) {
      t.push("💧 Stay hydrated - drink plenty of water")
      t.push("🧴 Apply sunscreen regularly")
      t.push("😎 Wear sunglasses to protect your eyes")
      t.push("👒 Wear a hat to reduce direct sun exposure")
      t.push("🕶️ Seek shade during peak sun hours (10am–4pm)")
      t.push("🧂 Replace electrolytes if you’re sweating a lot")
      t.push("🥵 Take breaks in cool areas if you feel dizzy or overheated")
      t.push("🚫 Limit intense outdoor exercise in mid-day heat")
      t.push("👕 Wear light-colored, breathable fabrics (cotton/linen/tech)")
      t.push("🧊 Cool down fast: cold water on wrists/neck, or a cool towel")
    } else if (temperature < 50) {
      t.push("🧣 Keep hands and face protected")
      t.push("💨 Avoid prolonged cold exposure")
      t.push("🔥 Stay warm with proper clothing")
      t.push("🧤 Wear gloves + warm socks to prevent numbness")
      t.push("🧥 Layer up (base layer + insulating layer + windproof outer)")
      t.push("🌬️ Wind chill can feel colder — add a windbreaker")
      t.push("☕ Warm drinks help you feel warmer (skip too much caffeine)")
      t.push("🚶‍♂️ Keep moving to maintain body heat")
      t.push("🚗 Keep an extra layer if commuting at night")
      t.push("🫁 Cold air can irritate lungs — consider a scarf over mouth/nose")
    }

    if (humidity > 70) {
      t.push("💦 High humidity - may affect breathing")
      t.push("😮‍💨 If you have asthma/allergies, keep meds handy")
      t.push("🧼 Shower/change clothes after being outside (reduces irritation)")
      t.push("👕 Choose moisture-wicking clothes to avoid sweat rash")
      t.push("🦶 Keep feet dry — change socks if they get damp")
      t.push("🧊 Use a fan/AC to reduce heat stress indoors")
    }

    if (humidity < 30) {
      t.push("💧 Dry air alert - moisturize skin")
      t.push("🌬️ Use a humidifier indoors")
      t.push("👄 Use lip balm to prevent chapped lips")
      t.push("👃 Saline spray can help dry noses")
      t.push("😴 Keep water near your bed if you wake up dry")
      t.push("🫗 Drink extra water (dry air dehydrates you faster)")
      t.push("🧴 Use gentle cleanser + thicker moisturizer at night")
    }

    // Dedupe
    const seen = new Set<string>()
    return t.filter((tip) => {
      const key = tip.trim().toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [temperature, humidity])

  return (
    <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Heart className="w-6 h-6 text-destructive" />
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-foreground">Health & Wellness</h3>
          <p className="text-sm text-muted-foreground">{tips.length} tips</p>
        </div>
      </div>

      {/* Scroll area (fixed height) */}
      <div
        className="
          rounded-xl border border-border/60 bg-muted/20
          max-h-64 md:max-h-72
          overflow-y-auto
          pr-2
        "
      >
        <div className="space-y-3 p-4">
          {tips.map((tip, idx) => (
            <div key={`${tip}-${idx}`} className="flex gap-3">
              <AlertCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-foreground text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
