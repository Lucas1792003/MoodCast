"use client"

import type React from "react"
import { useEffect, useMemo } from "react"
import { themeFromWeather, themeVars } from "@/lib/weather-theme"
import RainOverlay from "@/components/weather-effects/rain-overlay"
import SnowCanvas from "@/components/weather-effects/SnowCanvas"
import SunRaysOverlay from "@/components/weather-effects/sun-rays-overlay"
import CloudsOverlay from "@/components/weather-effects/clouds-overlay"
import FogOverlay from "@/components/weather-effects/fog-overlay"
import HeatwaveOverlay from "@/components/weather-effects/heatwave-overlay"
import CelestialOverlay from "@/components/weather-effects/celestial-overlay"
import EffectsPortal from "@/components/weather-effects/effects-portal"

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export default function WeatherThemeLayer({
  weatherCode,
  isDay,
  feelsLikeF,
  windSpeed,
  children,
}: {
  weatherCode: number
  isDay?: boolean
  feelsLikeF?: number | null
  windSpeed?: number | null
  children: React.ReactNode
}) {
  const baseTheme = useMemo(() => themeFromWeather(weatherCode, isDay), [weatherCode, isDay])

  const f = typeof feelsLikeF === "number" ? feelsLikeF : null
  const isHeat = f != null && f >= 90
  const theme = isHeat ? "heat" : baseTheme

  const vars = useMemo(() => themeVars(theme as any), [theme])

  const showRain = theme.startsWith("rain") || theme.startsWith("storm")
  const showFog = theme.startsWith("fog")
  const showClouds =
    theme.startsWith("cloudy") || theme.startsWith("rain") || theme.startsWith("storm")

  const showSunRays = theme === "clear_day" && !isHeat
  const showSnow = !isHeat && (baseTheme.startsWith("snow") || (f != null && f <= 32))

  const wind = typeof windSpeed === "number" ? windSpeed : 0
  const windFactor = clamp(wind / 35, 0, 1)

  const coldFactor = useMemo(() => {
    if (f == null) return 0
    return clamp((35 - f) / 35, 0, 1)
  }, [f])

  const insaneFactor = useMemo(() => {
    if (f == null) return 0
    return clamp((-20 - f) / 10, 0, 1)
  }, [f])

  const snowIntensity = useMemo(() => {
    if (!showSnow) return 0
    const base = 0.75 + coldFactor * 1.15 + windFactor * 0.45
    const insaneBoost = insaneFactor * 1.1
    return clamp(base + insaneBoost, 0.7, 3.2)
  }, [showSnow, coldFactor, windFactor, insaneFactor])

  const densityBoost = useMemo(() => {
    if (!showSnow) return 1
    const base = 1.0 + coldFactor * 1.9
    const insaneBoost = insaneFactor * 1.3
    return clamp(base + insaneBoost, 1.0, 4.2)
  }, [showSnow, coldFactor, insaneFactor])

  const windPush = useMemo(() => {
    if (!showSnow) return 0
    return clamp(windFactor, 0, 1) * (0.7 + insaneFactor * 0.3)
  }, [showSnow, windFactor, insaneFactor])

  useEffect(() => {
    const root = document.documentElement
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v)
    return () => {
      for (const k of Object.keys(vars)) root.style.removeProperty(k)
    }
  }, [vars])

  return (
    <div className="relative min-h-[100svh] min-h-screen weather-bg">
      {/* Effects are rendered into a viewport portal for better iOS reliability */}
      <EffectsPortal>
        <CelestialOverlay
          kind={isDay === false ? "moon" : "sun"}
          dim={
            theme.startsWith("storm")
              ? 1
              : theme.startsWith("rain")
                ? 0.6
                : theme.startsWith("fog")
                  ? 0.8
                  : theme.startsWith("cloudy")
                    ? 0.45
                    : 0
          }
        />

        {showSunRays ? <SunRaysOverlay /> : null}

        {showClouds ? (
          <CloudsOverlay
            variant={
              theme.startsWith("cloudy_day") || theme.startsWith("fog_day") ? "light" : "dark"
            }
          />
        ) : null}

        {showFog ? <FogOverlay /> : null}
        {isHeat ? <HeatwaveOverlay /> : null}
        {showRain ? <RainOverlay /> : null}

        <SnowCanvas
          enabled={showSnow}
          intensity={snowIntensity}
          densityBoost={densityBoost}
          wind={windPush}
          iconSrc="/snowflake.png"
          iconRate={0.35}
        />
      </EffectsPortal>

      <div className="relative z-10">{children}</div>
    </div>
  )
}
