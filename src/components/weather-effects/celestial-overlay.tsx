"use client"

import { useMemo } from "react"

type Props = {
  kind: "sun" | "moon"
  /** 0 = fully visible, 1 = very dim (storm/fog) */
  dim?: number
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export default function CelestialOverlay({ kind, dim = 0 }: Props) {
  const opacity = useMemo(() => clamp(0.9 - dim * 0.6, 0.15, 0.9), [dim])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed top-[-48px] right-[-48px] z-[1]"
      style={{ opacity }}
    >
      {kind === "sun" ? (
        <div className="mc-sun" />
      ) : (
        <div className="mc-moon" />
      )}
    </div>
  )
}
