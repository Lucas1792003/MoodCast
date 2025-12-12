"use client"

import { useEffect, useRef } from "react"

type Props = {
  enabled: boolean
  intensity?: number // overall: 0.7 -> 2.2
  wind?: number // -1..1
  iconSrc?: string
  iconRate?: number // 0..1
  densityBoost?: number // extra multiplier ONLY for number of flakes (e.g. 1.0..2.5)
}

type Flake = {
  x: number
  y: number
  r: number
  vy: number
  vx: number
  wobble: number
  wobbleSpeed: number
  opacity: number
  isIcon: boolean
  rot: number
  rotSpeed: number
  size: number
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export default function SnowCanvas({
  enabled,
  intensity = 1,
  wind = 0,
  iconSrc = "/snowflake.png",
  iconRate = 0.25,
  densityBoost = 1,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const flakesRef = useRef<Flake[]>([])
  const lastTRef = useRef<number>(0)
  const iconRef = useRef<HTMLImageElement | null>(null)
  const iconReadyRef = useRef<boolean>(false)

  useEffect(() => {
    iconReadyRef.current = false
    const img = new Image()
    img.src = iconSrc
    img.onload = () => {
      iconRef.current = img
      iconReadyRef.current = true
    }
    img.onerror = () => {
      iconRef.current = null
      iconReadyRef.current = false
    }
  }, [iconSrc])

  useEffect(() => {
    if (!enabled) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    if (prefersReduced) return

    const rand = (min: number, max: number) => min + Math.random() * (max - min)

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = "100%"
      canvas.style.height = "100%"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawn = (count: number) => {
      const w = window.innerWidth
      const h = window.innerHeight

      for (let i = 0; i < count; i++) {
        const isIcon = Math.random() < clamp(iconRate, 0, 1)

        const baseVy = rand(16, 70) * rand(0.75, 1.2)
        const baseVx = rand(-10, 10)
        const size = isIcon ? rand(10, 24) : rand(0.8, 2.9)

        flakesRef.current.push({
          x: rand(0, w),
          y: rand(-h, h),
          r: isIcon ? 0 : size,
          vy: baseVy,
          vx: baseVx,
          wobble: rand(0, Math.PI * 2),
          wobbleSpeed: rand(0.8, 2.4),
          opacity: rand(0.35, 0.95),
          isIcon,
          rot: rand(0, Math.PI * 2),
          rotSpeed: rand(-1.4, 1.4),
          size: isIcon ? size : 0,
        })
      }
    }

    resize()
    window.addEventListener("resize", resize)

    // ✅ Density scales more strongly than speed
    const base = Math.round((window.innerWidth * window.innerHeight) / 18000)
    const densityMult = clamp(densityBoost, 0.8, 3.0)
    const targetCount = clamp(Math.round(base * intensity * densityMult), 70, 650)

    flakesRef.current = []
    spawn(targetCount)

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - (lastTRef.current || t)) / 1000)
      lastTRef.current = t

      const w = window.innerWidth
      const h = window.innerHeight

      ctx.clearRect(0, 0, w, h)

      // subtle haze
      ctx.fillStyle = "rgba(255,255,255,0.015)"
      ctx.fillRect(0, 0, w, h)

      // ✅ Speed scales with intensity, but not as aggressively
      const speedMult = clamp(intensity, 0.6, 2.2)

      // wind push (px/sec)
      const windPush = clamp(wind, -1, 1) * 70

      const icon = iconRef.current
      const iconReady = iconReadyRef.current

      for (const f of flakesRef.current) {
        f.wobble += f.wobbleSpeed * dt
        const drift = Math.sin(f.wobble) * 10

        f.x += (f.vx + drift + windPush) * dt
        f.y += f.vy * speedMult * dt
        f.rot += f.rotSpeed * dt

        if (f.y > h + 30) {
          f.y = -30
          f.x = rand(0, w)
        }
        if (f.x < -50) f.x = w + 50
        if (f.x > w + 50) f.x = -50

        if (f.isIcon && iconReady && icon) {
          ctx.save()
          ctx.globalAlpha = f.opacity
          ctx.translate(f.x, f.y)
          ctx.rotate(f.rot)
          const s = f.size
          ctx.drawImage(icon, -s / 2, -s / 2, s, s)
          ctx.restore()
        } else {
          ctx.beginPath()
          ctx.fillStyle = `rgba(255,255,255,${f.opacity})`
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
      flakesRef.current = []
      lastTRef.current = 0
    }
  }, [enabled, intensity, wind, iconRate, iconSrc, densityBoost])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5]"
    />
  )
}
