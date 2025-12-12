"use client"

import { Shirt } from "lucide-react"

interface OutfitSectionProps {
  temperature: number
  weatherCode: number
}

export default function OutfitSection({ temperature, weatherCode }: OutfitSectionProps) {
  const getOutfitRecommendation = () => {
    const items = []
    let style = ""

    if (temperature > 80) {
      items.push("Lightweight shirt", "Shorts", "Sunglasses")
      style = "Summer Ready"
    } else if (temperature > 65) {
      items.push("T-shirt or light sweater", "Jeans", "Light jacket")
      style = "Casual Comfort"
    } else if (temperature > 50) {
      items.push("Long-sleeve shirt", "Jeans", "Sweater", "Jacket")
      style = "Layered Looks"
    } else {
      items.push("Thermal shirt", "Warm jeans", "Heavy coat", "Scarf", "Gloves")
      style = "Winter Warmth"
    }

    if (weatherCode >= 50) {
      items.push("Waterproof jacket")
    }

    return { items, style }
  }

  const rec = getOutfitRecommendation()

  return (
    <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Shirt className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Outfit Suggestion</h3>
      </div>
      <p className="text-primary font-semibold mb-4">{rec.style}</p>
      <div className="space-y-2">
        {rec.items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <span className="text-foreground text-sm">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
