"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence, useMotionValue } from "framer-motion"
import {
  MapPin,
  Shirt,
  Smile,
  Menu,
  X,
  Plus,
  HeartPulse,
  Check,
  type LucideIcon,
} from "lucide-react"
import { type CardId } from "@/config/cards"

type ItemId = CardId | "add"
type Item = { id: ItemId; icon: LucideIcon }

function cn(...c: Array<string | null | undefined | false>) {
  return c.filter(Boolean).join(" ")
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v))

function minStepDegForChord(minDist: number, r: number) {
  const rr = Math.max(1, r)
  const x = clamp(minDist / (2 * rr), 0, 0.999)
  const stepRad = 2 * Math.asin(x)
  return (stepRad * 180) / Math.PI
}

/** Icon registry */
function iconFor(id: CardId): LucideIcon {
  switch (id) {
    case "mood":
      return Smile
    case "outfit":
      return Shirt
    case "activity":
      return MapPin
    case "health":
      return HeartPulse
    default:
      return Menu
  }
}

/** Label registry */
function labelFor(id: CardId): string {
  switch (id) {
    case "mood":
      return "Mood"
    case "outfit":
      return "Outfit"
    case "activity":
      return "Activity"
    case "health":
      return "Health"
    default:
      return String(id)
  }
}

/** Fun tile colors */
function tileColor(id: CardId) {
  switch (id) {
    case "mood":
      return "from-yellow-200/90 to-orange-200/90"
    case "outfit":
      return "from-pink-200/90 to-rose-200/90"
    case "activity":
      return "from-sky-200/90 to-blue-200/90"
    case "health":
      return "from-emerald-200/90 to-teal-200/90"
    default:
      return "from-gray-200/90 to-gray-100/90"
  }
}

export function FloatingFanMenu({
  onSelect,
  className,
  headerOffsetPx = 84,
}: {
  onSelect: (id: CardId) => void
  className?: string
  headerOffsetPx?: number
}) {
  const [open, setOpen] = useState(false)
  const [isIdle, setIsIdle] = useState(false)

  /** The 3 fan shortcuts */
  const MAX_QUICK = 3
  const [quick, setQuick] = useState<CardId[]>(["mood", "outfit", "activity"])

  /** Which card is currently shown on the menu button when closed */
  const [current, setCurrent] = useState<CardId>("mood")

  /** Plus opens this picker */
  const [pickerOpen, setPickerOpen] = useState(false)
  const [draftQuick, setDraftQuick] = useState<CardId[]>(quick)

  /** All possible cards (add more later) */
  const ALL_CARDS: CardId[] = ["mood", "outfit", "activity", "health"]

  /* ===== SIZES ===== */
  const BTN = 56
  const HIT = 54
  const VIS = 44

  /* ===== PADDING / DOCKING ===== */
  const EDGE_PAD = 12
  const BOTTOM_PAD = 18

  const [vw, setVw] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0
  )
  const [vh, setVh] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 0
  )

  const [side, setSide] = useState<"left" | "right">("right")
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setVw(w)
      setVh(h)

      const topLimit = headerOffsetPx
      const bottomLimit = h - BTN - BOTTOM_PAD
      y.set(clamp(y.get() || bottomLimit, topLimit, bottomLimit))

      const leftX = EDGE_PAD
      const rightX = w - BTN - EDGE_PAD
      x.set(side === "left" ? leftX : rightX)
    }

    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [headerOffsetPx, side, x, y])

  useEffect(() => {
    if (!vw || !vh) return
    const rightX = vw - BTN - EDGE_PAD
    const bottomY = vh - BTN - BOTTOM_PAD
    x.set(rightX)
    y.set(clamp(bottomY, headerOffsetPx, bottomY))
  }, [vw, vh, headerOffsetPx, x, y])

  useEffect(() => {
    if (open || pickerOpen) {
      setIsIdle(false)
      return
    }
    const t = setTimeout(() => setIsIdle(true), 2500)
    return () => clearTimeout(t)
  }, [open, pickerOpen])

  const topLimit = headerOffsetPx
  const bottomLimit = Math.max(topLimit, vh - BTN - BOTTOM_PAD)
  const leftDockX = EDGE_PAD
  const rightDockX = Math.max(EDGE_PAD, vw - BTN - EDGE_PAD)

  const availableUp = useMemo(() => {
    if (!vh) return 220
    return Math.max(120, y.get() - topLimit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vh, topLimit])

  const availableInward = useMemo(() => {
    if (!vw) return 220
    if (side === "right") return Math.max(120, x.get() - (EDGE_PAD + HIT / 2))
    const menuRight = x.get() + BTN
    return Math.max(120, vw - menuRight - (EDGE_PAD + HIT / 2))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vw, side])

  /** Fan items: 3 quick + plus */
  const fanItems: Item[] = useMemo(() => {
    const normal = quick.slice(0, MAX_QUICK).map((id) => ({ id, icon: iconFor(id) }))
    return [...normal, { id: "add" as const, icon: Plus }]
  }, [quick])

  const solved = useMemo(() => {
    const n = fanItems.length
    const minDist = HIT * 0.92

    const desiredRadius = 92
    const minRadius = 70
    const maxRadiusByUp = Math.max(minRadius, availableUp * 0.88)

    let r = Math.min(desiredRadius, maxRadiusByUp)
    let spread = 92

    for (let i = 0; i < 3; i++) {
      const stepDeg = minStepDegForChord(minDist, r)
      const neededSpread = stepDeg * (n - 1) + 6
      spread = clamp(Math.max(78, neededSpread), 78, 150)

      const spreadRad = (spread * Math.PI) / 180
      const sinMax = Math.max(0.25, Math.sin(spreadRad))
      const maxRByInward = availableInward / sinMax

      r = clamp(r, minRadius, Math.min(maxRadiusByUp, maxRByInward))
    }

    return { radius: r, spreadDeg: spread }
  }, [availableUp, availableInward, fanItems.length])

  /** Inward opening */
  const points = useMemo(() => {
    const n = fanItems.length
    const start = 0
    const end = solved.spreadDeg
    const step = n > 1 ? (end - start) / (n - 1) : 0
    const dir = side === "left" ? 1 : -1

    return fanItems.map((_, i) => {
      const deg = start + step * i
      const rad = (deg * Math.PI) / 180
      return {
        x: solved.radius * Math.sin(rad) * dir,
        y: -solved.radius * Math.cos(rad),
        rot: (deg * 0.18 + 10) * dir,
      }
    })
  }, [fanItems, solved.radius, solved.spreadDeg, side])

  const snapToEdge = () => {
    if (!vw) return
    const cur = x.get()
    const distLeft = Math.abs(cur - leftDockX)
    const distRight = Math.abs(cur - rightDockX)
    const nextSide = distLeft <= distRight ? "left" : "right"
    setSide(nextSide)
    x.set(nextSide === "left" ? leftDockX : rightDockX)
  }

  const openPicker = () => {
    setOpen(false)
    setIsIdle(false)
    setDraftQuick(quick.slice(0, MAX_QUICK))
    setPickerOpen(true)
  }

  const closePicker = () => setPickerOpen(false)

  const toggleDraft = (id: CardId) => {
    setDraftQuick((prev) => {
      const has = prev.includes(id)
      if (has) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_QUICK) return prev
      return [...prev, id]
    })
  }

  const applyPicker = () => {
    const next = draftQuick.slice(0, MAX_QUICK)
    setQuick(next)

    if (!next.includes(current)) {
      setCurrent(next[0] ?? current)
    }

    setPickerOpen(false)
  }

  const onTapItem = (id: ItemId) => {
    if (id === "add") {
      openPicker()
      return
    }
    setCurrent(id)
    setOpen(false)
    onSelect(id)
  }

  const CurrentIcon = iconFor(current)

  return (
    <>
      {/* ===== Fun Icon Picker ===== */}
      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            className="fixed inset-0 z-[10000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Bright, fun backdrop */}
            <div
              className="absolute inset-0 backdrop-blur-md bg-gradient-to-br from-pink-100/50 via-sky-100/50 to-purple-100/50"
              onClick={closePicker}
            />

            {/* Panel */}
            <motion.div
              className={cn(
                "absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2",
                "rounded-3xl p-4 shadow-2xl backdrop-blur-xl",
                "bg-white/90 border border-white/60"
              )}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              style={{ marginTop: Math.max(0, headerOffsetPx * 0.15) }}
            >
              <div className="flex items-center justify-between gap-3 px-1 pb-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    Pick your favorites 
                  </div>
                  <div className="text-xs text-slate-500">
                    Choose exactly {draftQuick.length}/{MAX_QUICK}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closePicker}
                    className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-xs text-slate-700 hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyPicker}
                    disabled={draftQuick.length !== MAX_QUICK}
                    className={cn(
                      "rounded-xl px-3 py-2 text-xs font-medium transition",
                      draftQuick.length === MAX_QUICK
                        ? "bg-slate-900 text-white hover:opacity-90"
                        : "bg-slate-200 text-slate-500 cursor-not-allowed"
                    )}
                  >
                    Done
                  </button>
                </div>
              </div>

              {/* Grid (icon + label) */}
              <div className="grid grid-cols-4 gap-3">
                {ALL_CARDS.map((id) => {
                  const Icon = iconFor(id)
                  const selected = draftQuick.includes(id)
                  return (
                    <motion.button
                      key={id}
                      type="button"
                      onClick={() => toggleDraft(id)}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        "relative flex flex-col items-center justify-center gap-2 rounded-2xl p-3",
                        "bg-gradient-to-br shadow transition",
                        tileColor(id),
                        "hover:-translate-y-0.5 hover:shadow-md",
                        selected ? "ring-2 ring-white/80 scale-[1.02]" : ""
                      )}
                    >
                      <Icon className="h-6 w-6 text-slate-900" strokeWidth={1.8} />
                      <span className="text-[11px] font-medium text-slate-800 leading-none">
                        {labelFor(id)}
                      </span>

                      {selected && (
                        <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-white shadow">
                          <Check className="h-3 w-3 text-slate-900" />
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              <div className="pt-3 text-xs text-slate-500">
                Tip: tap tiles to select. “Done” unlocks when you pick {MAX_QUICK}.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Floating Fan ===== */}
      <motion.div
        className={cn("fixed z-[9999] lg:hidden", className)}
        style={{ left: 0, top: 0, x, y, width: BTN, height: BTN }}
        drag={!pickerOpen}
        dragMomentum={false}
        dragElastic={0.08}
        onDragStart={() => setOpen(false)}
        onDragEnd={snapToEdge}
        dragConstraints={{
          left: leftDockX,
          right: rightDockX,
          top: topLimit,
          bottom: bottomLimit,
        }}
      >
        <div className="relative" style={{ width: BTN, height: BTN }}>
          {/* FAN ITEMS */}
          {fanItems.map((item, i) => {
            const Icon = item.icon
            const p = points[i]

            return (
              <motion.button
                key={`${String(item.id)}-${i}`}
                type="button"
                onClick={() => open && onTapItem(item.id)}
                aria-label={String(item.id)}
                initial={false}
                animate={
                  open
                    ? { opacity: 1, x: p.x, y: p.y, rotate: p.rot, scale: 1 }
                    : { opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.9 }
                }
                transition={{
                  type: "spring",
                  stiffness: 560,
                  damping: 36,
                  delay: open ? i * 0.05 : 0,
                }}
                className={cn(
                  "absolute inset-0",
                  open ? "pointer-events-auto" : "pointer-events-none"
                )}
                style={{
                  width: HIT,
                  height: HIT,
                  zIndex: open ? 10 + i : 0,
                  transformOrigin: "50% 100%",
                }}
              >
                <span
                  className={cn(
                    "absolute inset-0 m-auto grid place-items-center",
                    "rounded-2xl shadow-xl",
                    "bg-background/85 backdrop-blur-xl",
                    "border border-border/70",
                    "text-foreground",
                    "hover:bg-accent hover:text-accent-foreground",
                    "active:scale-[0.98] transition"
                  )}
                  style={{
                    width: VIS,
                    height: VIS,
                    borderRadius: 16,
                    transform: "rotate(-12deg)",
                  }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
              </motion.button>
            )
          })}

          {/* MENU BUTTON */}
          <motion.button
            type="button"
            onClick={() => {
              if (pickerOpen) return
              setOpen((v) => !v)
            }}
            onPointerDown={() => setIsIdle(false)}
            animate={{ opacity: isIdle ? 0.4 : 1 }}
            whileTap={{ scale: 0.92 }}
            transition={{ opacity: { duration: 0.5 } }}
            className={cn(
              "absolute inset-0 z-50",
              "grid place-items-center",
              "rounded-full shadow-2xl",
              "bg-background/90 backdrop-blur-xl",
              "border border-border/70",
              "text-foreground",
              "hover:bg-accent hover:text-accent-foreground"
            )}
            style={{ width: BTN, height: BTN }}
            aria-label="menu"
          >
            {open ? (
              <X className="h-5 w-5" strokeWidth={2} />
            ) : (
              <CurrentIcon className="h-5 w-5" strokeWidth={2} />
            )}
          </motion.button>
        </div>
      </motion.div>
    </>
  )
}
