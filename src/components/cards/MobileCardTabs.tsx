"use client"

import { type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Smile,
  Shirt,
  MapPin,
  Heart,
  type LucideIcon,
} from "lucide-react"
import { type CardId, CARD_CONFIGS, MOBILE_TAB_CARDS } from "@/config/cards"

type MobileCardTabsProps = {
  activeTab: CardId | null
  onTabChange: (cardId: CardId) => void
  children: Record<CardId, ReactNode>
  visibleCards?: CardId[]
}

const CARD_ICONS: Partial<Record<CardId, LucideIcon>> = {
  mood: Smile,
  outfit: Shirt,
  activity: MapPin,
  health: Heart,
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function MobileCardTabs({
  activeTab,
  onTabChange,
  children,
  visibleCards,
}: MobileCardTabsProps) {
  // Filter to only show tabs for visible cards that are in MOBILE_TAB_CARDS
  const tabCards = MOBILE_TAB_CARDS.filter(
    (id) => !visibleCards || visibleCards.includes(id)
  )

  const effectiveActiveTab = activeTab && tabCards.includes(activeTab) ? activeTab : tabCards[0]

  // Hide the unused variables to avoid linter warnings
  void onTabChange
  void CARD_ICONS
  void CARD_CONFIGS

  return (
    <div className="lg:hidden">
      {/* Tab Content - no tab bar, navigation via FloatingFanMenu */}
      <div className="mt-2">
        <AnimatePresence mode="wait">
          {effectiveActiveTab && children[effectiveActiveTab] && (
            <motion.div
              key={effectiveActiveTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children[effectiveActiveTab]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Desktop grid layout - shows all cards
export function DesktopCardGrid({
  children,
  visibleCards,
}: {
  children: Record<CardId, ReactNode>
  visibleCards?: CardId[]
}) {
  const cardsToShow = MOBILE_TAB_CARDS.filter(
    (id) => !visibleCards || visibleCards.includes(id)
  )

  return (
    <div className="hidden lg:block">
      {/* Mood + Outfit row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {cardsToShow.includes("mood") && children.mood}
        {cardsToShow.includes("outfit") && children.outfit}
      </div>

      {/* Activity */}
      {cardsToShow.includes("activity") && (
        <div className="mb-8">{children.activity}</div>
      )}

      {/* Health */}
      {cardsToShow.includes("health") && (
        <div className="mb-8">{children.health}</div>
      )}
    </div>
  )
}

// Combined responsive layout component
export function ResponsiveCardLayout({
  activeTab,
  onTabChange,
  children,
  visibleCards,
}: MobileCardTabsProps) {
  return (
    <>
      <MobileCardTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        children={children}
        visibleCards={visibleCards}
      />
      <DesktopCardGrid children={children} visibleCards={visibleCards} />
    </>
  )
}
