import React from "react"
import {
  Clock,
  BadgeCheck,
  Signal,
  ExternalLink,
  Footprints,
  Bike,
  Car,
  Play,
} from "lucide-react"
import { Pill, ModeChip } from "./ui"
import { cn, timeAgo } from "./utils"
import type { Mode } from "./types"

type NavigationControlsProps = {
  mode: Mode
  setMode: (mode: Mode) => void
  gpsAccuracyM: number | null
  lastGpsAt: number | null
  now: number
  userPos: { lat: number; lng: number } | null
  selectedPlace: { lat: number; lon: number } | null
  googleMapsHref: string
  appleMapsHref: string
  onStartNavigation?: () => void
  isNavigating?: boolean
}

export function NavigationControls({
  mode,
  setMode,
  gpsAccuracyM,
  lastGpsAt,
  now,
  userPos,
  selectedPlace,
  googleMapsHref,
  appleMapsHref,
  onStartNavigation,
  isNavigating,
}: NavigationControlsProps) {
  const updatedAgo = timeAgo(lastGpsAt ?? undefined, now)
  const highAccuracy = gpsAccuracyM != null && gpsAccuracyM <= 30

  return (
    <div className="mt-3">
      {/* MOBILE / TABLET */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 lg:hidden">
        {/* Row 1: Accuracy + Updated */}
        <div className="grid grid-cols-2 gap-2">
          <Pill size="sm" variant="outline" className="w-full justify-center">
            {highAccuracy ? <BadgeCheck className="w-3.5 h-3.5" /> : <Signal className="w-3.5 h-3.5" />}
            {gpsAccuracyM ? `Accuracy ~${Math.round(gpsAccuracyM)}m` : "Accuracy N/A"}
          </Pill>

          <Pill size="sm" variant="outline" className="w-full justify-center">
            <Clock className="w-3.5 h-3.5" />
            {updatedAgo ? `Updated ${updatedAgo}` : "Updated —"}
          </Pill>
        </div>

        {/* Row 2: Walk/Bike/Drive */}
        <div className="mt-2 grid grid-cols-3 gap-2">
          <ModeChip
            size="sm"
            active={mode === "walk"}
            label="Walk"
            icon={<Footprints className="w-4 h-4" />}
            onClick={() => setMode("walk")}
            className="w-full justify-center"
          />
          <ModeChip
            size="sm"
            active={mode === "bike"}
            label="Bike"
            icon={<Bike className="w-4 h-4" />}
            onClick={() => setMode("bike")}
            className="w-full justify-center"
          />
          <ModeChip
            size="sm"
            active={mode === "drive"}
            label="Drive"
            icon={<Car className="w-4 h-4" />}
            onClick={() => setMode("drive")}
            className="w-full justify-center"
          />
        </div>

        {/* Row 3: Start + Google + Apple */}
        <div className="mt-2 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onStartNavigation}
            disabled={!userPos || !selectedPlace || isNavigating}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs",
              isNavigating
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-50",
              (!userPos || !selectedPlace) && "opacity-50 cursor-not-allowed"
            )}
          >
            <Play className="w-4 h-4" />
            {isNavigating ? "Navigating" : "Start"}
          </button>

          <a
            href={googleMapsHref}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs",
              "border border-slate-200 bg-white hover:bg-slate-50",
              !userPos || !selectedPlace ? "pointer-events-none opacity-50" : ""
            )}
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            Google
          </a>

          <a
            href={appleMapsHref}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs",
              "border border-slate-200 bg-white hover:bg-slate-50",
              !userPos || !selectedPlace ? "pointer-events-none opacity-50" : ""
            )}
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            Apple
          </a>
        </div>
      </div>

      {/* WEB */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 hidden lg:block">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-none">
            <ModeChip
              size="sm"
              active={mode === "walk"}
              label="Walk"
              icon={<Footprints className="w-4 h-4" />}
              onClick={() => setMode("walk")}
            />
            <ModeChip
              size="sm"
              active={mode === "bike"}
              label="Bike"
              icon={<Bike className="w-4 h-4" />}
              onClick={() => setMode("bike")}
            />
            <ModeChip
              size="sm"
              active={mode === "drive"}
              label="Drive"
              icon={<Car className="w-4 h-4" />}
              onClick={() => setMode("drive")}
            />
          </div>

          <div className="flex items-center gap-2 flex-none">
            <Pill size="sm" variant="outline">
              {highAccuracy ? <BadgeCheck className="w-3.5 h-3.5" /> : <Signal className="w-3.5 h-3.5" />}
              {gpsAccuracyM ? `Accuracy ~${Math.round(gpsAccuracyM)}m` : "Accuracy N/A"}
            </Pill>

            <Pill size="sm" variant="outline">
              <Clock className="w-3.5 h-3.5" />
              {updatedAgo ? `Updated ${updatedAgo}` : "Updated —"}
            </Pill>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onStartNavigation}
              disabled={!userPos || !selectedPlace || isNavigating}
              className={cn(
                "inline-flex w-[220px] flex-none items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs",
                isNavigating
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white hover:bg-slate-50",
                (!userPos || !selectedPlace) && "opacity-50 cursor-not-allowed"
              )}
            >
              <Play className="w-4 h-4" />
              {isNavigating ? "Navigating" : "Start"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={googleMapsHref}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "inline-flex w-[120px] flex-none items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs",
                "border border-slate-200 bg-white hover:bg-slate-50",
                !userPos || !selectedPlace ? "pointer-events-none opacity-50" : ""
              )}
            >
              <ExternalLink className="w-4 h-4" />
              Google
            </a>

            <a
              href={appleMapsHref}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "inline-flex w-[120px] flex-none items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs",
                "border border-slate-200 bg-white hover:bg-slate-50",
                !userPos || !selectedPlace ? "pointer-events-none opacity-50" : ""
              )}
            >
              <ExternalLink className="w-4 h-4" />
              Apple
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
