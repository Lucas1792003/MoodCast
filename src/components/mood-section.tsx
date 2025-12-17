"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { RotateCcw, Sparkles, ChevronDown, X } from "lucide-react"
import {
  type MoodId,
  ALL_MOODS,
  getMoodConfig,
  getSuggestedMood,
} from "@/lib/mood-types"

interface MoodSectionProps {
  temperature: number
  weatherCode: number
  selectedMood: MoodId | null
  onMoodChange: (mood: MoodId) => void
}

function cn(...c: Array<string | null | undefined | false>) {
  return c.filter(Boolean).join(" ")
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "").trim()
  const full = h.length === 3 ? h.split("").map((x) => x + x).join("") : h
  const n = parseInt(full, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return { r, g, b }
}

function rgba(hex: string, a: number) {
  try {
    const { r, g, b } = hexToRgb(hex)
    return `rgba(${r}, ${g}, ${b}, ${a})`
  } catch {
    return `rgba(77, 182, 208, ${a})`
  }
}

export default function MoodSection({
  weatherCode,
  selectedMood,
  onMoodChange,
}: MoodSectionProps) {
  const suggestedMood = getSuggestedMood(weatherCode)
  const currentMoodId = selectedMood ?? suggestedMood
  const mood = getMoodConfig(currentMoodId)

  const isCustom = selectedMood !== null && selectedMood !== suggestedMood
  const accent = mood.accent ?? "#4DB6D0"
  const energy = Math.max(0, Math.min(100, (mood as any).energy ?? 70))

  const [open, setOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)

  const moods = useMemo(
    () => ALL_MOODS.map((id) => ({ id, cfg: getMoodConfig(id) })),
    []
  )

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const softRing = rgba(accent, 0.22)

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-[26px] bg-white shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)] ring-1 ring-black/5"
    >
      {/* Ambient wash (clipped) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[26px]">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(120% 90% at 25% -10%, ${rgba(accent, 0.18)} 0%, transparent 60%),
              radial-gradient(90% 70% at 110% 85%, ${rgba(accent, 0.12)} 0%, transparent 55%)
            `,
          }}
        />
      </div>

      <div className="relative p-7 sm:p-8">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: accent }} />
            <p className="text-sm font-semibold tracking-wide" style={{ color: accent }}>
              YOUR VIBE
            </p>
          </div>

          {isCustom && (
            <button
              type="button"
              onClick={() => {
                onMoodChange(suggestedMood)
                setOpen(false)
              }}
              className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-black/60 ring-1 ring-black/10 hover:bg-white hover:text-black/80 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>

        {/* Main block (tap to open overlay) */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-7 w-full text-left focus:outline-none"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <div className="flex items-start gap-6">
            {/* Icon tile */}
            <div
              className="relative grid h-[78px] w-[78px] place-items-center rounded-2xl bg-white/70 ring-1 ring-black/10"
              style={{ boxShadow: `0 18px 70px -50px ${accent}` }}
            >
              <span className="text-4xl">{mood.emoji}</span>

              {/* Suggested dot */}
              {currentMoodId === suggestedMood && (
                <span
                  className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: accent,
                    boxShadow: `0 0 0 4px ${rgba(accent, 0.16)}`,
                  }}
                />
              )}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-4xl font-semibold tracking-tight text-neutral-900">
                  {mood.label}
                </h3>

                {isCustom ? (
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ backgroundColor: rgba(accent, 0.14), color: accent }}
                  >
                    Custom
                  </span>
                ) : (
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ backgroundColor: rgba(accent, 0.12), color: accent }}
                  >
                    Suggested
                  </span>
                )}

                <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-neutral-500">
                  Change <ChevronDown className="h-4 w-4" />
                </span>
              </div>

              <p className="mt-2 text-base italic text-neutral-600">
                “{mood.suggestion}”
              </p>
            </div>
          </div>
        </button>

        {/* Energy */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest text-neutral-600">
              ENERGY LEVEL
            </p>
            <p className="text-lg font-semibold" style={{ color: accent }}>
              {energy}%
            </p>
          </div>

          <div className="mt-3 h-3 w-full rounded-full bg-black/10 overflow-hidden">
            <div
              className="h-3 rounded-full"
              style={{
                width: `${energy}%`,
                background: `linear-gradient(90deg, ${rgba(accent, 0.65)} 0%, ${accent} 55%, ${rgba(
                  accent,
                  0.8
                )} 100%)`,
              }}
            />
          </div>

          <p className="mt-3 text-xs text-neutral-500">
            Tap the card to pick a different mood.
          </p>
        </div>
      </div>

      {/* ===== Overlay chooser (INSIDE card) ===== */}
      {open && (
        <div className="absolute inset-0 z-40">
          {/* soft scrim */}
          <button
            type="button"
            aria-label="Close mood chooser"
            onClick={() => setOpen(false)}
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${rgba(accent, 0.10)} 0%, rgba(0,0,0,0.10) 100%)`,
            }}
          />

          {/* Sheet */}
          <div className="absolute inset-3 sm:inset-4">
            <div
              className="h-full overflow-hidden rounded-2xl ring-1 ring-black/10 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.75)]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.88) 100%)",
                backdropFilter: "blur(10px)",
              }}
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div
                className="flex items-start justify-between gap-3 px-4 py-3"
                style={{
                  background: `linear-gradient(180deg, ${rgba(accent, 0.12)} 0%, ${rgba(
                    accent,
                    0.06
                  )} 100%)`,
                  borderBottom: `1px solid ${rgba(accent, 0.18)}`,
                }}
              >
                <div>
                  <div className="text-xs font-semibold text-neutral-900">
                    Choose your vibe
                  </div>
                  <div className="text-[11px] text-neutral-600">
                    Suggested is highlighted.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 text-neutral-600 hover:bg-white/70 hover:text-neutral-900 transition ring-1 ring-black/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scroll body */}
              <div
                className={cn(
                  "h-[calc(100%-56px)] overflow-y-auto p-3",
                  "[&::-webkit-scrollbar]:w-2",
                  "[&::-webkit-scrollbar-track]:bg-transparent",
                  "[&::-webkit-scrollbar-thumb]:rounded-full",
                  "[&::-webkit-scrollbar-thumb]:bg-black/10",
                  "hover:[&::-webkit-scrollbar-thumb]:bg-black/20"
                )}
                style={{
                  scrollbarColor: `${rgba(accent, 0.38)} transparent`,
                  scrollbarWidth: "thin" as any,
                }}
              >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {moods.map(({ id, cfg }) => {
                    const active = id === currentMoodId
                    const suggested = id === suggestedMood
                    const cfgAccent = cfg.accent ?? accent

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          onMoodChange(id) // ✅ updates mood card
                          setOpen(false)  // ✅ closes overlay
                        }}
                        className={cn(
                          "group relative flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ring-1",
                          "hover:-translate-y-[1px] active:translate-y-0"
                        )}
                        style={{
                          backgroundColor: active
                            ? rgba(cfgAccent, 0.16)
                            : "rgba(255,255,255,0.78)",
                          borderColor: active
                            ? rgba(cfgAccent, 0.32)
                            : "rgba(0,0,0,0.08)",
                          boxShadow: active
                            ? `0 14px 40px -28px ${rgba(cfgAccent, 0.55)}`
                            : "0 10px 26px -26px rgba(0,0,0,0.35)",
                          color: "rgb(23 23 23)",
                        }}
                      >
                        <span
                          className="grid h-8 w-8 place-items-center rounded-xl ring-1"
                          style={{
                            backgroundColor: rgba(cfgAccent, 0.12),
                            borderColor: rgba(cfgAccent, 0.24),
                          }}
                        >
                          <span className="text-base">{cfg.emoji}</span>
                        </span>

                        <span className="truncate">{cfg.label}</span>

                        {suggested && (
                          <span
                            className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                              backgroundColor: rgba(cfgAccent, 0.14),
                              color: cfgAccent,
                              border: `1px solid ${rgba(cfgAccent, 0.22)}`,
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: cfgAccent }}
                            />
                            Suggested
                          </span>
                        )}

                        {active && (
                          <span
                            className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full ring-4"
                            style={{
                              backgroundColor: cfgAccent,
                              boxShadow: `0 10px 20px -14px ${rgba(cfgAccent, 0.8)}`,
                              borderColor: rgba(cfgAccent, 0.14),
                            }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* bottom breathing room */}
                <div className="h-2" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* soft border tint */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[26px]"
        style={{ boxShadow: `inset 0 0 0 1px ${softRing}` }}
      />
    </div>
  )
}
