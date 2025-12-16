"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, useMotionValue } from "framer-motion"
import {
  MapPin,
  Shirt,
  Smile,
  Menu,
  X,
  Plus,
  HeartPulse,
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
  const [quick, setQuick] = useState<CardId[]>(["mood", "outfit", "activity"])
  const [current, setCurrent] = useState<CardId>("mood")
  const [replaceMode, setReplaceMode] = useState(false)
  const [pendingNew, setPendingNew] = useState<CardId | null>(null)
  const ALL_CARDS: CardId[] = ["mood", "outfit", "activity", "health"]
  const extraChoices = ALL_CARDS.filter((c) => !quick.includes(c))
  const BTN = 56
  const HIT = 54
  const VIS = 44
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
  }, [headerOffsetPx, side])

  useEffect(() => {
    if (!vw || !vh) return
    const rightX = vw - BTN - EDGE_PAD
    const bottomY = vh - BTN - BOTTOM_PAD
    x.set(rightX)
    y.set(clamp(bottomY, headerOffsetPx, bottomY))
  }, [vw, vh])

  useEffect(() => {
    if (open) {
      setIsIdle(false)
      return
    }

    const timer = setTimeout(() => {
      setIsIdle(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [open])

  const topLimit = headerOffsetPx
  const bottomLimit = Math.max(topLimit, vh - BTN - BOTTOM_PAD)

  const leftDockX = EDGE_PAD
  const rightDockX = Math.max(EDGE_PAD, vw - BTN - EDGE_PAD)

  const availableUp = useMemo(() => {
    if (!vh) return 220
    return Math.max(120, y.get() - topLimit)

  }, [vh, topLimit])

  const availableInward = useMemo(() => {
    if (!vw) return 220
    if (side === "right") {
      return Math.max(120, x.get() - (EDGE_PAD + HIT / 2))
    }
    const menuRight = x.get() + BTN
    return Math.max(120, vw - menuRight - (EDGE_PAD + HIT / 2))
  }, [vw, side])

  const fanItems: Item[] = useMemo(() => {
    if (replaceMode && !pendingNew) {
      const extras = extraChoices.map((id: CardId) => ({ id, icon: iconFor(id) }))
      return [...extras, { id: "add" as const, icon: Plus }] 
    }

    if (replaceMode && pendingNew) {
      const targets = quick.map((id) => ({ id, icon: iconFor(id) }))
      return [...targets, { id: "add", icon: Plus }] 
    }

    const normal = quick.map((id) => ({ id, icon: iconFor(id) }))
    return [...normal, { id: "add" as const, icon: Plus }]
  }, [replaceMode, pendingNew, quick, extraChoices])

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

  const closeAll = () => {
    setOpen(false)
    setReplaceMode(false)
    setPendingNew(null)
  }

  const onTapItem = (id: ItemId) => {
    if (id === "add") {
      if (replaceMode) {
        closeAll()
        return
      }
      setReplaceMode(true)
      setPendingNew(null)
      setOpen(true)
      return
    }

    if (replaceMode && !pendingNew) {
      setPendingNew(id)
      return
    }

    if (replaceMode && pendingNew) {
      const target = id
      setQuick((prev) => {
        const targetIdx = prev.indexOf(target)
        const pendingIdx = prev.indexOf(pendingNew)
        if (pendingIdx !== -1 && targetIdx !== -1) {
          const newQuick = [...prev]
          newQuick[targetIdx] = pendingNew
          newQuick[pendingIdx] = target
          return newQuick
        }
        return prev.map((c) => (c === target ? pendingNew : c))
      })
      setCurrent(pendingNew)
      onSelect(pendingNew)
      closeAll()
      return
    }
    setCurrent(id)
    setOpen(false)
    onSelect(id)
  }

  const CurrentIcon = iconFor(current)

  return (
    <motion.div
      className={cn("fixed z-[9999] lg:hidden", className)}
      style={{ left: 0, top: 0, x, y, width: BTN, height: BTN }}
      drag
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
        <motion.button
          type="button"
          onClick={() => {
            if (open && replaceMode) closeAll()
            else setOpen((v) => !v)
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
  )
}
