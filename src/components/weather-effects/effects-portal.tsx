"use client"

import type { ReactNode } from "react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

export default function EffectsPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let root = document.getElementById("mc-effects-root")
    if (!root) {
      root = document.createElement("div")
      root.id = "mc-effects-root"
      document.body.appendChild(root)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const apply = () => {
      const vv = window.visualViewport
      const w = Math.round(vv?.width ?? window.innerWidth)
      const h = Math.round(vv?.height ?? window.innerHeight)
      const top = Math.round(vv?.offsetTop ?? 0)
      const left = Math.round(vv?.offsetLeft ?? 0)

      const el = wrapperRef.current
      if (!el) return

      el.style.setProperty("--vv-width", `${w}px`)
      el.style.setProperty("--vv-height", `${h}px`)
      el.style.setProperty("--vv-top", `${top}px`)
      el.style.setProperty("--vv-left", `${left}px`)
    }

    apply()

    const vv = window.visualViewport
    window.addEventListener("resize", apply, { passive: true })
    window.addEventListener("scroll", apply, { passive: true })
    window.addEventListener("orientationchange", apply)

    vv?.addEventListener("resize", apply, { passive: true })
    vv?.addEventListener("scroll", apply, { passive: true })

    // keyboard open/close
    window.addEventListener("focusin", apply)
    window.addEventListener("focusout", apply)

    return () => {
      window.removeEventListener("resize", apply)
      window.removeEventListener("scroll", apply)
      window.removeEventListener("orientationchange", apply)

      vv?.removeEventListener("resize", apply)
      vv?.removeEventListener("scroll", apply)

      window.removeEventListener("focusin", apply)
      window.removeEventListener("focusout", apply)
    }
  }, [mounted])

  if (!mounted) return null
  const root = document.getElementById("mc-effects-root")
  if (!root) return null

  return createPortal(
    <div ref={wrapperRef} aria-hidden className="mc-effects-root">
      {children}
    </div>,
    root
  )
}
