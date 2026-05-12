export type CardId =
  | "weather"
  | "weather-info"
  | "forecast-hourly"
  | "forecast-7day"
  | "weather-alerts"
  | "mood"
  | "outfit"
  | "activity"
  | "health"
  | "ar-sky"

export type CardSize = "small" | "medium" | "large" | "full"

export type CardConfig = {
  id: CardId
  title: string
  description: string
  icon: string
  defaultEnabled: boolean
  defaultOrder: number
  desktopSize: CardSize
  mobileSize: CardSize
  canHide: boolean
  canReorder: boolean
  category: "weather" | "lifestyle" | "activity" | "health"
}

export const CARD_CONFIGS: Record<CardId, CardConfig> = {
  weather: {
    id: "weather",
    title: "Weather",
    description: "Current weather conditions and temperature",
    icon: "Cloud",
    defaultEnabled: true,
    defaultOrder: 0,
    desktopSize: "large",
    mobileSize: "full",
    canHide: false,
    canReorder: false,
    category: "weather",
  },
  "weather-info": {
    id: "weather-info",
    title: "Weather Details",
    description: "Detailed weather metrics like humidity, wind, UV index",
    icon: "Info",
    defaultEnabled: true,
    defaultOrder: 1,
    desktopSize: "medium",
    mobileSize: "full",
    canHide: true,
    canReorder: true,
    category: "weather",
  },
  "weather-alerts": {
    id: "weather-alerts",
    title: "Weather Alerts",
    description: "Extreme weather notifications (storms, heat, cold, flooding, wind)",
    icon: "AlertTriangle",
    defaultEnabled: true,
    defaultOrder: 3,
    desktopSize: "medium",
    mobileSize: "full",
    canHide: true,
    canReorder: true,
    category: "weather",
  },
  "forecast-hourly": {
    id: "forecast-hourly",
    title: "Hourly Forecast",
    description: "24-hour temperature forecast",
    icon: "Clock",
    defaultEnabled: true,
    defaultOrder: 2,
    desktopSize: "full",
    mobileSize: "full",
    canHide: true,
    canReorder: true,
    category: "weather",
  },
  "forecast-7day": {
    id: "forecast-7day",
    title: "7-Day Forecast",
    description: "Weekly weather forecast",
    icon: "CalendarDays",
    defaultEnabled: true,
    defaultOrder: 3,
    desktopSize: "medium",
    mobileSize: "full",
    canHide: true,
    canReorder: true,
    category: "weather",
  },
  mood: {
    id: "mood",
    title: "Mood",
    description: "Weather-based mood recommendations",
    icon: "Smile",
    defaultEnabled: true,
    defaultOrder: 4,
    desktopSize: "small",
    mobileSize: "full",
    canHide: true,
    canReorder: true,
    category: "lifestyle",
  },
  outfit: {
    id: "outfit",
    title: "Outfit",
    description: "AI-powered outfit suggestions based on weather",
    icon: "Shirt",
    defaultEnabled: true,
    defaultOrder: 5,
    desktopSize: "small",
    mobileSize: "full",
    canHide: true,
    canReorder: true,
    category: "lifestyle",
  },
  activity: {
    id: "activity",
    title: "Activities",
    description: "Nearby activity suggestions with map and routing",
    icon: "MapPin",
    defaultEnabled: true,
    defaultOrder: 6,
    desktopSize: "full",
    mobileSize: "full",
    canHide: true,
    canReorder: true,
    category: "activity",
  },
  health: {
    id: "health",
    title: "Health Tips",
    description: "Weather-based health and wellness tips",
    icon: "Heart",
    defaultEnabled: true,
    defaultOrder: 7,
    desktopSize: "full",
    mobileSize: "full",
    canHide: true,
    canReorder: true,
    category: "health",
  },
  "ar-sky": {
    id: "ar-sky",
    title: "Sky Viewer",
    description: "Visual sky conditions representation",
    icon: "Sun",
    defaultEnabled: true,
    defaultOrder: 8,
    desktopSize: "full",
    mobileSize: "full",
    canHide: true,
    canReorder: true,
    category: "weather",
  },
}

export const DEFAULT_CARD_ORDER: CardId[] = [
  "weather",
  "weather-info",
  "forecast-hourly",
  "weather-alerts",
  "forecast-7day",
  "mood",
  "outfit",
  "activity",
  "health",
  "ar-sky",
]

export const MOBILE_TAB_CARDS: CardId[] = [
  "forecast-hourly",
  "weather-alerts",
  "forecast-7day",
  "mood",
  "outfit",
  "activity",
  "health",
]

export function getCardConfig(id: CardId): CardConfig {
  return CARD_CONFIGS[id]
}

export function getEnabledCards(preferences?: Partial<Record<CardId, boolean>>): CardId[] {
  return DEFAULT_CARD_ORDER.filter((id) => {
    const config = CARD_CONFIGS[id]
    if (!config.canHide) return true
    return preferences?.[id] ?? config.defaultEnabled
  })
}
