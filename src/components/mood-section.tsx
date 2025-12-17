"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { RotateCcw, Sparkles } from "lucide-react"
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
  const anchorRef = useRef<HTMLButtonElement | null>(null)
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null)

  const moods = useMemo(
    () => ALL_MOODS.map((id) => ({ id, cfg: getMoodConfig(id) })),
    []
  )

  const computePos = () => {
    const card = cardRef.current
    const anchor = anchorRef.current
    if (!card || !anchor) return

    const cardRect = card.getBoundingClientRect()
    const aRect = anchor.getBoundingClientRect()

    const pad = 22
    const top = aRect.bottom - cardRect.top + 14
    const maxWidth = cardRect.width - pad * 2
    const width = Math.min(520, maxWidth)

    let left = aRect.left - cardRect.left
    left = Math.max(pad, Math.min(left, pad + maxWidth - width))

    setPos({ left, top, width })
  }

  useLayoutEffect(() => {
    if (!open) return
    computePos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentMoodId])

  useEffect(() => {
    if (!open) return
    const onResize = () => computePos()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      const card = cardRef.current
      if (!card) return
      if (e.target instanceof Node && !card.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("touchstart", onDown, { passive: true })
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("touchstart", onDown)
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-[26px] bg-white shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)] ring-1 ring-black/5"
    >
      {/* soft ambient wash like your reference */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            `radial-gradient(120% 85% at 30% 0%, ${accent}22 0%, transparent 60%),
             radial-gradient(90% 70% at 100% 80%, ${accent}18 0%, transparent 55%)`,
        }}
      />

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

        {/* Main block (click/anchor for popover) */}
        <button
          ref={anchorRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-7 w-full text-left focus:outline-none"
        >
          <div className="flex items-start gap-6">
            {/* Icon tile */}
            <div
              className="grid h-[76px] w-[76px] place-items-center rounded-2xl bg-white/70 ring-1 ring-black/10"
              style={{ boxShadow: `0 18px 60px -45px ${accent}` }}
            >
              <span className="text-4xl">{mood.emoji}</span>
            </div>

            {/* Text */}
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-4xl font-semibold tracking-tight text-neutral-900">
                  {mood.label}
                </h3>
                {isCustom && (
                  <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                    Custom
                  </span>
                )}
              </div>

              <p className="mt-2 text-base italic text-neutral-600">
                “{mood.suggestion}”
              </p>
            </div>
          </div>
        </button>

        {/* Energy Level */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest text-neutral-600">
              ENERGY LEVEL
            </p>
            <p className="text-lg font-semibold" style={{ color: accent }}>
              {energy}%
            </p>
          </div>

          <div className="mt-3 h-3 w-full rounded-full bg-black/10">
            <div
              className="h-3 rounded-full"
              style={{
                width: `${energy}%`,
                backgroundColor: accent,
              }}
            />
          </div>
        </div>

        <div className="mt-7 border-t border-black/10 pt-5 text-center text-sm text-neutral-500">
          👆 Tap to change mood
        </div>

        {/* Popover (inside card) */}
        {open && pos && (
          <div className="absolute z-30" style={{ left: pos.left, top: pos.top, width: pos.width }}>
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_50px_140px_-90px_rgba(0,0,0,0.7)] ring-1 ring-black/10">
              <div className="px-4 py-3" style={{ backgroundColor: `${accent}14` }}>
                <div className="text-xs font-semibold text-neutral-900">Choose mood</div>
                <div className="text-[11px] text-neutral-600">
                  Suggested is marked.
                </div>
              </div>

              <div className="p-3 max-h-[280px] overflow-y-auto">
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
                          onMoodChange(id)
                          setOpen(false)
                        }}
                        className={[
                          "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                          active
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
                        ].join(" ")}
                      >
                        <span className="text-base">{cfg.emoji}</span>
                        <span className="truncate">{cfg.label}</span>

                        {suggested && !active && (
                          <span
                            className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ backgroundColor: `${cfgAccent}18`, color: cfgAccent }}
                          >
                            Suggested
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
