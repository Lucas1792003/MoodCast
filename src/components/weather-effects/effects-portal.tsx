"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"

/**
 * Renders weather effects into a fixed, full-viewport portal.
 *
 * Why: Mobile Safari/Chrome can fail to paint or clip fixed-position layers
 * when they live inside an ancestor with overflow/scrolling. Putting effects
 * at the document body level is the most reliable cross-browser approach.
 */
export default function EffectsPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  const root = useMemo(() => {
    if (typeof document === "undefined") return null
    return document.getElementById("mc-effects-root")
  }, [mounted])

  useEffect(() => {
    if (typeof document === "undefined") return

    let el = document.getElementById("mc-effects-root")
    if (!el) {
      el = document.createElement("div")
      el.id = "mc-effects-root"
      document.body.appendChild(el)
    }

    setMounted(true)
    return () => {
      // keep the root around to avoid DOM churn across client navigations
    }
  }, [])

  if (!mounted || !root) return null

  return createPortal(
    <div aria-hidden className="mc-effects-root">
      {children}
    </div>,
    root
  )
}
