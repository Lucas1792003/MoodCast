"use client"

export default function FogOverlay() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[3] overflow-hidden">
      <div className="mc-fog mc-fog--1" />
      <div className="mc-fog mc-fog--2" />
    </div>
  )
}
