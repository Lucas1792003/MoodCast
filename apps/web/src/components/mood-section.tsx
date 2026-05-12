"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Sparkles, X, RotateCcw, ChevronDown } from "lucide-react"
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

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v))

/**
 * Energy circle style taken from your example:
 * - outer border ring (faint)
 * - svg arc progress with strokeDasharray
 * - center number + ENERGY label
 */
function EnergyCircle({
  value,
  accent,
}: {
  value: number
  accent: string
}) {
  const energy = clamp(value, 0, 100)

  // For viewBox 0..100, r=42 => circumference ≈ 263.89 (your example uses 264)
  const C = 264
  const dash = (energy / 100) * C

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div
        className="relative grid place-items-center h-24 w-24 rounded-full border-4"
        style={{
          borderColor: rgba(accent, 0.22),
          backgroundColor: rgba(accent, 0.06),
          boxShadow: `0 18px 60px -45px ${rgba(accent, 0.65)}`,
        }}
        aria-label={`Energy ${energy}`}
      >
        {/* arc */}
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={accent}
            strokeWidth="6"
            strokeDasharray={`${dash} ${C}`}
            strokeLinecap="round"
            opacity="0.85"
            style={{
              filter: `drop-shadow(0 0 4px ${rgba(accent, 0.35)})`,
            }}
          />
        </svg>

        <div className="text-center leading-none">
          <div className="text-2xl font-extrabold tabular-nums" style={{ color: accent }}>
            {Math.round(energy)}
          </div>
          <div className="mt-0.5 text-[9px] font-semibold tracking-[0.14em] text-neutral-600">
            ENERGY
          </div>
        </div>
      </div>
    </div>
  )
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
  const energy = clamp(mood.energy, 0, 100)

  const [open, setOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)

  const moods = useMemo(
    () => ALL_MOODS.map((id) => ({ id, cfg: getMoodConfig(id) })),
    []
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const softRing = rgba(accent, 0.12)

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={() => !open && setOpen(true)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !open) {
          e.preventDefault()
          setOpen(true)
        }
      }}
      className="relative w-full overflow-hidden rounded-[26px] ring-1 ring-black/5 shadow-[0_18px_50px_-35px_rgba(0,0,0,0.45)] text-left transition hover:shadow-[0_22px_60px_-30px_rgba(0,0,0,0.5)] active:scale-[0.995] cursor-pointer"
      style={{
        background:
          "linear-gradient(135deg, rgba(248,252,255,1) 0%, rgba(240,248,255,1) 55%, rgba(247,252,255,1) 100%)",
      }}
      aria-haspopup="dialog"
      aria-expanded={open}
    >
      {/* ambient wash */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-24 -top-28 h-72 w-72 rounded-full blur-2xl"
          style={{ backgroundColor: rgba(accent, 0.12) }}
        />
        <div
          className="absolute -right-28 -bottom-28 h-72 w-72 rounded-full blur-2xl"
          style={{ backgroundColor: rgba(accent, 0.10) }}
        />
        <div className="absolute inset-0 opacity-[0.55] [background:radial-gradient(900px_320px_at_40%_0%,rgba(255,255,255,0.85),transparent_60%)]" />
      </div>

      <div className="relative p-6 sm:p-7">
        {/* top label */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: accent }} />
            <div
              className="text-sm font-semibold tracking-[0.20em]"
              style={{ color: rgba(accent, 0.9) }}
            >
              MOOD
            </div>
          </div>

          {isCustom && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                onMoodChange(suggestedMood)
                setOpen(false)
              }}
              className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-black/60 ring-1 ring-black/10 hover:bg-white hover:text-black/80 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </span>
          )}
        </div>

        {/* main row */}
        <div className="mt-5">
          <div className="flex items-start justify-between gap-6">
            {/* left */}
            <div className="min-w-0">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{mood.emoji}</div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-3xl sm:text-4xl font-extrabold text-neutral-900">
                      {mood.label}
                    </div>

                    <span
                      className="hidden sm:inline-block rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ backgroundColor: rgba(accent, 0.10), color: accent }}
                    >
                      {isCustom ? "Custom" : "Suggested"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-base italic text-neutral-600">
                "{mood.suggestion}"
              </div>
            </div>

            {/* right: energy circle */}
            <EnergyCircle value={energy} accent={accent} />
          </div>
        </div>

        {/* bottom divider + hint */}
        <div className="mt-6 border-t border-black/5 pt-5">
          <div className="text-center text-sm text-neutral-500">
            Tap to change your mood
          </div>
        </div>
      </div>

      {/* ===== overlay chooser (inside card) ===== */}
      {open && (
        <div className="absolute inset-0 z-40">
          <div
            aria-label="Close mood chooser"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
            className="absolute inset-0 cursor-pointer"
            style={{
              background: `linear-gradient(180deg, ${rgba(accent, 0.10)} 0%, rgba(0,0,0,0.10) 100%)`,
            }}
          />

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
              <div
                className="flex items-start justify-between gap-3 px-4 py-3"
                style={{
                  background: `linear-gradient(180deg, ${rgba(accent, 0.12)} 0%, ${rgba(accent, 0.06)} 100%)`,
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
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpen(false)
                  }}
                  className="rounded-full p-2 text-neutral-600 hover:bg-white/70 hover:text-neutral-900 transition ring-1 ring-black/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

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
                        onClick={(e) => {
                          e.stopPropagation()
                          onMoodChange(id)
                          setOpen(false)
                        }}
                        className={cn(
                          "group relative flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ring-1",
                          "hover:-translate-y-[1px] active:translate-y-0"
                        )}
                        style={{
                          backgroundColor: active
                            ? rgba(cfgAccent, 0.14)
                            : "rgba(255,255,255,0.78)",
                          borderColor: active
                            ? rgba(cfgAccent, 0.30)
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
                            backgroundColor: rgba(cfgAccent, 0.10),
                            borderColor: rgba(cfgAccent, 0.22),
                          }}
                        >
                          <span className="text-base">{cfg.emoji}</span>
                        </span>

                        <span className="truncate">{cfg.label}</span>

                        {suggested && (
                          <span
                            className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                              backgroundColor: rgba(cfgAccent, 0.12),
                              color: cfgAccent,
                              border: `1px solid ${rgba(cfgAccent, 0.20)}`,
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

                <div className="h-2" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* subtle inner border tint */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[26px]"
        style={{ boxShadow: `inset 0 0 0 1px ${softRing}` }}
      />
    </div>
  )
}
