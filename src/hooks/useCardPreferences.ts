import { useState, useEffect, useCallback } from "react"
import { type CardId, DEFAULT_CARD_ORDER, CARD_CONFIGS } from "@/config/cards"

const STORAGE_KEY = "moodcast_card_preferences"

export type CardPreferences = {
  order: CardId[]
  visibility: Partial<Record<CardId, boolean>>
  activeTab: CardId | null // For mobile tab navigation
}

const DEFAULT_PREFERENCES: CardPreferences = {
  order: DEFAULT_CARD_ORDER,
  visibility: {},
  activeTab: "mood",
}

function loadPreferences(): CardPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_PREFERENCES

    const parsed = JSON.parse(stored) as Partial<CardPreferences>

    return {
      order: Array.isArray(parsed.order) ? parsed.order : DEFAULT_CARD_ORDER,
      visibility: parsed.visibility ?? {},
      activeTab: parsed.activeTab ?? "mood",
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

function savePreferences(prefs: CardPreferences) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // Storage might be full or disabled
  }
}

export function useCardPreferences() {
  const [preferences, setPreferences] = useState<CardPreferences>(DEFAULT_PREFERENCES)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setPreferences(loadPreferences())
    setIsLoaded(true)
  }, [])

  // Save to localStorage when preferences change
  useEffect(() => {
    if (isLoaded) {
      savePreferences(preferences)
    }
  }, [preferences, isLoaded])

  const setCardOrder = useCallback((order: CardId[]) => {
    setPreferences((prev) => ({ ...prev, order }))
  }, [])

  const setCardVisibility = useCallback((cardId: CardId, visible: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      visibility: { ...prev.visibility, [cardId]: visible },
    }))
  }, [])

  const toggleCard = useCallback((cardId: CardId) => {
    setPreferences((prev) => {
      const currentVisibility = prev.visibility[cardId] ?? CARD_CONFIGS[cardId].defaultEnabled
      return {
        ...prev,
        visibility: { ...prev.visibility, [cardId]: !currentVisibility },
      }
    })
  }, [])

  const setActiveTab = useCallback((cardId: CardId | null) => {
    setPreferences((prev) => ({ ...prev, activeTab: cardId }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES)
  }, [])

  const isCardVisible = useCallback(
    (cardId: CardId): boolean => {
      const config = CARD_CONFIGS[cardId]
      if (!config.canHide) return true
      return preferences.visibility[cardId] ?? config.defaultEnabled
    },
    [preferences.visibility]
  )

  const getVisibleCards = useCallback((): CardId[] => {
    return preferences.order.filter((id) => isCardVisible(id))
  }, [preferences.order, isCardVisible])

  return {
    preferences,
    isLoaded,
    setCardOrder,
    setCardVisibility,
    toggleCard,
    setActiveTab,
    resetToDefaults,
    isCardVisible,
    getVisibleCards,
  }
}
