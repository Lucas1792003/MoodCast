"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  RotateCcw,
  Circle,
  MapPin,
  Navigation,
  X,
  Volume2,
  VolumeX,
} from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "./utils"
import { formatDuration } from "./utils"
import type { NavigationStep } from "./useNavigation"
import { getManeuverIcon } from "./useNavigation"

type NavigationPanelProps = {
  isNavigating: boolean
  currentStep: NavigationStep | null
  nextStep: NavigationStep | null
  distanceToNextStepM: number
  remainingDistanceM: number
  remainingDurationS: number
  arrivalTime: Date | null
  currentStepIndex: number
  totalSteps: number
  onStop: () => void
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

function formatTime(date: Date | null): string {
  if (!date) return "--:--"
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function ManeuverIcon({
  type,
  modifier,
  className,
}: {
  type: string
  modifier?: string
  className?: string
}) {
  const iconType = getManeuverIcon(type, modifier)
  const iconClass = cn("w-5 h-5", className)

  switch (iconType) {
    case "left":
      return <ArrowLeft className={iconClass} />
    case "right":
      return <ArrowRight className={iconClass} />
    case "slight-left":
      return <CornerUpLeft className={iconClass} />
    case "slight-right":
      return <CornerUpRight className={iconClass} />
    case "sharp-left":
      return <CornerDownLeft className={iconClass} />
    case "sharp-right":
      return <CornerDownRight className={iconClass} />
    case "uturn":
      return <RotateCcw className={iconClass} />
    case "roundabout":
      return <Circle className={iconClass} />
    case "arrive":
      return <MapPin className={iconClass} />
    case "depart":
      return <Navigation className={iconClass} />
    case "straight":
    default:
      return <ArrowUp className={iconClass} />
  }
}

export function NavigationPanel({
  isNavigating,
  currentStep,
  nextStep,
  distanceToNextStepM,
  remainingDistanceM,
  remainingDurationS,
  arrivalTime,
  currentStepIndex,
  totalSteps,
  onStop,
}: NavigationPanelProps) {
  const [isMuted, setIsMuted] = useState(false)

  // Voice announcement for new steps
  useEffect(() => {
    if (!isNavigating || !currentStep || isMuted) return
    if (!("speechSynthesis" in window)) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(currentStep.instruction)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    window.speechSynthesis.speak(utterance)

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [currentStepIndex, isNavigating, isMuted])

  // Suppress unused variable warnings
  void nextStep
  void arrivalTime
  void totalSteps

  if (!isNavigating) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="absolute bottom-2 left-2 right-2 z-20"
      >
        {/* Compact navigation card */}
        <div className="rounded-xl bg-blue-600 text-white shadow-lg overflow-hidden">
          <div className="p-2.5 flex items-center gap-2.5">
            {/* Maneuver icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              {currentStep && (
                <ManeuverIcon
                  type={currentStep.maneuver.type}
                  modifier={currentStep.maneuver.modifier}
                  className="w-6 h-6"
                />
              )}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold">
                  {formatDistance(distanceToNextStepM)}
                </span>
                <span className="text-xs opacity-80 truncate">
                  {currentStep?.instruction || "Calculating..."}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] opacity-75">
                <span>{formatDistance(remainingDistanceM)} left</span>
                <span>·</span>
                <span>{formatDuration(remainingDurationS)}</span>
                <span>·</span>
                <span>ETA {formatTime(arrivalTime)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={onStop}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"
                aria-label="Stop navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-blue-800/50 flex">
            <div
              className="h-full bg-white/80 transition-all duration-300"
              style={{ width: `${Math.min(100, ((currentStepIndex + 1) / Math.max(1, totalSteps)) * 100)}%` }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
